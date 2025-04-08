import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { Artwork } from "@/types";
import { toast } from "sonner";
import { useGalleryStore } from "@/lib/store";

// Gallery configuration parameters
const GALLERY_WIDTH = 50;
const GALLERY_HEIGHT = 8;
const GALLERY_DEPTH = 30;
const WALL_COLOR = 0xf5f5f5;
const FLOOR_COLOR = 0x222222;
const CEILING_COLOR = 0xeeeeee;
const FRAME_COLOR = 0x8b4513; // Brown color for frames
const FRAME_THICKNESS = 0.1;
const ARTWORK_SPACING = 5;

interface Gallery3DProps {
  artworks: Artwork[];
}

const Gallery3D = ({ artworks }: Gallery3DProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null);
  const { getArtworkById } = useGalleryStore();

  // State to track mouse position for raycasting
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Keep refs to three.js objects that need to be accessed in event handlers
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameObjectsRef = useRef<Array<{ mesh: THREE.Mesh, artwork: Artwork }>>([]);
  const controlsActive = useRef(true);

  // Camera movement state
  const movementRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    speed: 0.15,
  });

  // Handle mouse movement for camera rotation
  const handleMouseMove = (event: MouseEvent) => {
    if (!controlsActive.current || !canvasRef.current || !cameraRef.current) return;

    // Calculate normalized device coordinates for raycasting
    const rect = canvasRef.current.getBoundingClientRect();
    setMousePosition({
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
    });
  };

  // Handle keyboard controls for movement
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!controlsActive.current) return;
    
    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        movementRef.current.forward = true;
        break;
      case "s":
      case "arrowdown":
        movementRef.current.backward = true;
        break;
      case "a":
      case "arrowleft":
        movementRef.current.left = true;
        break;
      case "d":
      case "arrowright":
        movementRef.current.right = true;
        break;
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case "w":
      case "arrowup":
        movementRef.current.forward = false;
        break;
      case "s":
      case "arrowdown":
        movementRef.current.backward = false;
        break;
      case "a":
      case "arrowleft":
        movementRef.current.left = true;
        break;
      case "d":
      case "arrowright":
        movementRef.current.right = false;
        break;
    }
  };

  // Create and set up the 3D gallery
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Set up the scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000000);

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.set(0, 2, 10);
    
    // Set up the renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    canvasRef.current.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light (like sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add point lights around the gallery
    const pointLight1 = new THREE.PointLight(0xffffff, 0.8, 50);
    pointLight1.position.set(GALLERY_WIDTH / 4, GALLERY_HEIGHT - 1, 0);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 50);
    pointLight2.position.set(-GALLERY_WIDTH / 4, GALLERY_HEIGHT - 1, 0);
    scene.add(pointLight2);

    // Create gallery walls, floor, and ceiling
    const createGallery = () => {
      // Floor
      const floorGeometry = new THREE.PlaneGeometry(GALLERY_WIDTH, GALLERY_DEPTH);
      const floorMaterial = new THREE.MeshStandardMaterial({
        color: FLOOR_COLOR,
        roughness: 0.8,
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
      floor.position.y = 0;
      floor.receiveShadow = true;
      scene.add(floor);

      // Ceiling
      const ceilingGeometry = new THREE.PlaneGeometry(GALLERY_WIDTH, GALLERY_DEPTH);
      const ceilingMaterial = new THREE.MeshStandardMaterial({
        color: CEILING_COLOR,
        roughness: 0.8,
      });
      const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
      ceiling.rotation.x = Math.PI / 2; // Rotate to be horizontal, facing down
      ceiling.position.y = GALLERY_HEIGHT;
      scene.add(ceiling);

      // Back wall
      const backWallGeometry = new THREE.PlaneGeometry(GALLERY_WIDTH, GALLERY_HEIGHT);
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: WALL_COLOR,
        roughness: 0.5,
      });
      const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
      backWall.position.z = -GALLERY_DEPTH / 2;
      backWall.position.y = GALLERY_HEIGHT / 2;
      scene.add(backWall);

      // Left wall
      const leftWallGeometry = new THREE.PlaneGeometry(GALLERY_DEPTH, GALLERY_HEIGHT);
      const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
      leftWall.rotation.y = Math.PI / 2; // Rotate to face inward
      leftWall.position.x = -GALLERY_WIDTH / 2;
      leftWall.position.y = GALLERY_HEIGHT / 2;
      scene.add(leftWall);

      // Right wall
      const rightWallGeometry = new THREE.PlaneGeometry(GALLERY_DEPTH, GALLERY_HEIGHT);
      const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
      rightWall.rotation.y = -Math.PI / 2; // Rotate to face inward
      rightWall.position.x = GALLERY_WIDTH / 2;
      rightWall.position.y = GALLERY_HEIGHT / 2;
      scene.add(rightWall);
    };

    // Create the gallery structure
    createGallery();

    // Load and display artworks
    const loadArtworks = async () => {
      let maxArtworksPerWall = Math.min(6, Math.floor(artworks.length / 3));
      if (maxArtworksPerWall === 0 && artworks.length > 0) maxArtworksPerWall = 1;
      
      frameObjectsRef.current = [];
      
      // Function to create artwork display with frame
      const createArtworkDisplay = (
        artwork: Artwork,
        position: THREE.Vector3,
        rotation: THREE.Euler
      ) => {
        // Create a texture loader
        const textureLoader = new THREE.TextureLoader();
        
        // Create promised-based texture loading
        const loadTexture = (url: string) => {
          return new Promise<THREE.Texture>((resolve) => {
            textureLoader.load(url, (texture) => {
              resolve(texture);
            });
          });
        };
        
        // Load the texture
        loadTexture(artwork.imageUrl).then((texture) => {
          // Calculate aspect ratio to maintain proportions
          const imageAspect = texture.image.width / texture.image.height;
          
          // Set artwork dimensions based on aspect ratio
          const artworkWidth = 2;
          const artworkHeight = artworkWidth / imageAspect;
          
          // Create artwork plane
          const artworkGeometry = new THREE.PlaneGeometry(artworkWidth, artworkHeight);
          const artworkMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide,
          });
          const artworkMesh = new THREE.Mesh(artworkGeometry, artworkMaterial);
          
          // Create a frame around the artwork
          const frameWidth = artworkWidth + FRAME_THICKNESS * 2;
          const frameHeight = artworkHeight + FRAME_THICKNESS * 2;
          
          // Create frame as a group of planes
          const frameGroup = new THREE.Group();
          
          // Top frame
          const topFrameGeometry = new THREE.BoxGeometry(
            frameWidth,
            FRAME_THICKNESS,
            FRAME_THICKNESS
          );
          const frameMaterial = new THREE.MeshStandardMaterial({
            color: FRAME_COLOR,
            roughness: 0.5,
          });
          const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
          topFrame.position.y = artworkHeight / 2 + FRAME_THICKNESS / 2;
          
          // Bottom frame
          const bottomFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
          bottomFrame.position.y = -artworkHeight / 2 - FRAME_THICKNESS / 2;
          
          // Left frame
          const leftFrameGeometry = new THREE.BoxGeometry(
            FRAME_THICKNESS,
            frameHeight,
            FRAME_THICKNESS
          );
          const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
          leftFrame.position.x = -artworkWidth / 2 - FRAME_THICKNESS / 2;
          
          // Right frame
          const rightFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
          rightFrame.position.x = artworkWidth / 2 + FRAME_THICKNESS / 2;
          
          // Add all parts to the frame group
          frameGroup.add(topFrame, bottomFrame, leftFrame, rightFrame, artworkMesh);
          
          // Position and rotate the entire frame+artwork assembly
          frameGroup.position.copy(position);
          frameGroup.rotation.copy(rotation);
          
          // Add to scene
          scene.add(frameGroup);
          
          // Store reference to artwork for interaction
          frameObjectsRef.current.push({
            mesh: frameGroup,
            artwork: artwork,
          });
        });
      };
      
      // Distribute artworks along walls
      const displayArtworks = () => {
        const backWallCount = Math.min(maxArtworksPerWall, artworks.length);
        const leftWallCount = artworks.length > backWallCount ? Math.min(maxArtworksPerWall, artworks.length - backWallCount) : 0;
        const rightWallCount = artworks.length > backWallCount + leftWallCount ? Math.min(maxArtworksPerWall, artworks.length - backWallCount - leftWallCount) : 0;
        
        // Calculate spacing
        const backWallSpacing = GALLERY_WIDTH / (backWallCount + 1);
        const sideWallSpacing = GALLERY_DEPTH / (Math.max(leftWallCount, rightWallCount) + 1);
        
        // Place artworks on back wall
        for (let i = 0; i < backWallCount; i++) {
          const x = -GALLERY_WIDTH / 2 + backWallSpacing * (i + 1);
          const position = new THREE.Vector3(x, GALLERY_HEIGHT / 2, -GALLERY_DEPTH / 2 + 0.1);
          const rotation = new THREE.Euler(0, 0, 0);
          createArtworkDisplay(artworks[i], position, rotation);
        }
        
        // Place artworks on left wall
        for (let i = 0; i < leftWallCount; i++) {
          const z = -GALLERY_DEPTH / 2 + sideWallSpacing * (i + 1);
          const position = new THREE.Vector3(-GALLERY_WIDTH / 2 + 0.1, GALLERY_HEIGHT / 2, z);
          const rotation = new THREE.Euler(0, Math.PI / 2, 0);
          createArtworkDisplay(artworks[backWallCount + i], position, rotation);
        }
        
        // Place artworks on right wall
        for (let i = 0; i < rightWallCount; i++) {
          const z = -GALLERY_DEPTH / 2 + sideWallSpacing * (i + 1);
          const position = new THREE.Vector3(GALLERY_WIDTH / 2 - 0.1, GALLERY_HEIGHT / 2, z);
          const rotation = new THREE.Euler(0, -Math.PI / 2, 0);
          createArtworkDisplay(artworks[backWallCount + leftWallCount + i], position, rotation);
        }
      };
      
      displayArtworks();
      setIsLoading(false);
    };
    
    loadArtworks();
    
    // Set up raycaster for artwork interaction
    const raycaster = new THREE.Raycaster();
    
    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      // Handle camera movement
      if (controlsActive.current && cameraRef.current) {
        const deltaTime = clock.getDelta();
        const camera = cameraRef.current;
        const movement = movementRef.current;
        
        // Get camera direction
        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);
        
        // Calculate movement vectors
        const forward = direction.clone().multiplyScalar(movement.speed);
        const right = direction.clone().cross(new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(movement.speed);
        
        // Apply movement
        if (movement.forward) camera.position.add(forward);
        if (movement.backward) camera.position.sub(forward);
        if (movement.left) camera.position.sub(right);
        if (movement.right) camera.position.add(right);
        
        // Keep camera within gallery bounds
        const margin = 1;
        camera.position.x = Math.max(-GALLERY_WIDTH / 2 + margin, Math.min(GALLERY_WIDTH / 2 - margin, camera.position.x));
        camera.position.y = Math.max(1, Math.min(GALLERY_HEIGHT - 1, camera.position.y));
        camera.position.z = Math.max(-GALLERY_DEPTH / 2 + margin, Math.min(GALLERY_DEPTH / 2 - margin, camera.position.z));
      }
      
      // Check for artwork interactions
      if (sceneRef.current && cameraRef.current) {
        raycaster.setFromCamera(mousePosition, cameraRef.current);
        const intersects = raycaster.intersectObjects(
          frameObjectsRef.current.map(obj => obj.mesh), true
        );
        
        if (intersects.length > 0) {
          document.body.style.cursor = "pointer";
        } else {
          document.body.style.cursor = "default";
        }
      }
      
      // Render scene
      if (sceneRef.current && cameraRef.current && rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Set up event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    // Handle click events for artwork interaction
    const handleClick = (event: MouseEvent) => {
      if (!sceneRef.current || !cameraRef.current) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouse = {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((event.clientY - rect.top) / rect.height) * 2 + 1,
      };
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      // Find intersections with artworks
      const intersects = raycaster.intersectObjects(
        frameObjectsRef.current.map(obj => obj.mesh), true
      );
      
      if (intersects.length > 0) {
        // Find which artwork was clicked
        for (const { mesh, artwork } of frameObjectsRef.current) {
          if (intersects[0].object.parent === mesh || mesh.children.includes(intersects[0].object)) {
            setActiveArtwork(artwork);
            const selectedArtwork = getArtworkById(artwork.id);
            if (selectedArtwork) {
              toast.info("Opening " + selectedArtwork.title);
              navigate(`/artwork/${artwork.id}`);
            }
            break;
          }
        }
      }
    };
    
    window.addEventListener("click", handleClick);
    
    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener("resize", handleResize);
    
    // Clean up on component unmount
    return () => {
      if (rendererRef.current && canvasRef.current) {
        canvasRef.current.removeChild(rendererRef.current.domElement);
      }
      
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
    };
  }, [artworks, navigate, getArtworkById]);
  
  return (
    <div className="relative w-full h-screen">
      <div 
        ref={canvasRef} 
        className="w-full h-full" 
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-10">
          <div className="text-white text-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4">Loading gallery...</p>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2 px-4 rounded-md mx-auto max-w-md">
        <p className="text-sm">
          <strong>Controls:</strong> Use W, A, S, D or arrow keys to move. Click on artworks to view details.
        </p>
      </div>
    </div>
  );
};

export default Gallery3D;
