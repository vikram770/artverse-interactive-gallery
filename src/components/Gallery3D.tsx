
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Artwork } from "@/types";
import { useGalleryStore } from "@/lib/store";

interface Gallery3DProps {
  artworks: Artwork[];
}

const Gallery3D = ({ artworks }: Gallery3DProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const { getArtworkById } = useGalleryStore();
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    
    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Gallery walls
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,
      roughness: 0.8,
    });
    
    // Floor
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floor = new THREE.Mesh(floorGeometry, wallMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2;
    scene.add(floor);
    
    // Back wall
    const backWallGeometry = new THREE.PlaneGeometry(20, 10);
    const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.z = -5;
    backWall.position.y = 3;
    scene.add(backWall);
    
    // Side walls
    const leftWallGeometry = new THREE.PlaneGeometry(10, 10);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.x = -10;
    leftWall.position.y = 3;
    scene.add(leftWall);
    
    const rightWallGeometry = new THREE.PlaneGeometry(10, 10);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.x = 10;
    rightWall.position.y = 3;
    scene.add(rightWall);
    
    // Artwork frames
    const artworkObjects: THREE.Mesh[] = [];
    const textureLoader = new THREE.TextureLoader();
    
    const frameGeometry = new THREE.BoxGeometry(0.1, 2, 2);
    const frameMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x5f4b32,
      roughness: 0.5,
    });
    
    // Position artworks in a circle
    const radius = 8;
    const artworkCount = Math.min(artworks.length, 12); // Limit to 12 artworks for performance
    
    for (let i = 0; i < artworkCount; i++) {
      const artwork = artworks[i];
      const angle = (i / artworkCount) * Math.PI * 2;
      
      const x = radius * Math.sin(angle);
      const z = radius * Math.cos(angle);
      
      // Create artwork texture
      const texture = textureLoader.load(artwork.imageUrl);
      texture.colorSpace = THREE.SRGBColorSpace;
      
      const artworkMaterial = new THREE.MeshBasicMaterial({ map: texture });
      const artworkGeometry = new THREE.PlaneGeometry(1.8, 1.8);
      const artworkMesh = new THREE.Mesh(artworkGeometry, artworkMaterial);
      
      // Create frame
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.scale.set(1, 1.1, 1.1);
      
      // Group artwork and frame
      const group = new THREE.Group();
      group.add(artworkMesh);
      group.add(frame);
      
      // Position and rotate to face center
      group.position.set(x, 1, z);
      group.lookAt(0, 1, 0);
      
      // Store reference to artwork data
      (group as any).userData = { artworkId: artwork.id };
      
      scene.add(group);
      artworkObjects.push(group as THREE.Mesh);
    }
    
    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const onMouseClick = async (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, camera);
      
      // Calculate objects intersecting the ray
      const intersects = raycaster.intersectObjects(artworkObjects, true);
      
      if (intersects.length > 0) {
        // Find the parent group that has the userData
        let currentObject: THREE.Object3D | null = intersects[0].object;
        while (currentObject && !currentObject.userData?.artworkId) {
          currentObject = currentObject.parent;
        }
        
        if (currentObject && currentObject.userData?.artworkId) {
          const artworkId = currentObject.userData.artworkId;
          const artwork = await getArtworkById(artworkId);
          if (artwork) {
            setSelectedArtwork(artwork);
          }
        }
      }
    };
    
    window.addEventListener('click', onMouseClick);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', onMouseClick);
      
      // Dispose geometries and materials
      artworkObjects.forEach(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(material => material.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      });
    };
  }, [artworks, getArtworkById]);
  
  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />
      
      {selectedArtwork && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white p-4 rounded-lg max-w-md backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-2">{selectedArtwork.title}</h3>
          <p className="text-sm mb-2">{selectedArtwork.description}</p>
          <div className="flex justify-between text-xs text-gray-300">
            <span>Artist: {selectedArtwork.artistId}</span>
            <span>{selectedArtwork.category} • {selectedArtwork.year}</span>
          </div>
          <button 
            className="absolute top-2 right-2 text-white/60 hover:text-white"
            onClick={() => setSelectedArtwork(null)}
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="absolute top-4 left-4 text-white/70 text-sm bg-black/30 p-2 rounded backdrop-blur-sm">
        <p>Click on artworks to view details</p>
        <p>Drag to rotate • Scroll to zoom</p>
      </div>
    </div>
  );
};

export default Gallery3D;
