
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

const AuthForms = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated } = useAuthStore();
  
  // Check if we should default to register tab
  const queryParams = new URLSearchParams(location.search);
  const defaultTab = queryParams.get("register") ? "register" : "login";
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "visitor" as "visitor" | "artist" | "admin",
  });
  
  // Form errors
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  
  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);
    
    const { email, password } = loginData;
    
    if (!email || !password) {
      setLoginError("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate("/");
      } else {
        setLoginError("Invalid email or password");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setIsLoading(true);
    
    const { username, email, password, confirmPassword, role } = registerData;
    
    if (!username || !email || !password || !confirmPassword) {
      setRegisterError("Please fill in all fields");
      setIsLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setRegisterError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setRegisterError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Registering with data:", { username, email, password, role });
      const success = await register({
        username,
        email,
        password,
        role
      });
      
      if (success) {
        toast.success("Registration successful!");
        // Don't navigate immediately - let auth state change trigger the redirect
      } else {
        setRegisterError("Registration failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegisterError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Sign in to your ArtVerse account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLoginSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => 
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-sm text-blue-500 hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => 
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                
                {loginError && (
                  <p className="text-red-500 text-sm">{loginError}</p>
                )}
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Create an account</CardTitle>
              <CardDescription>
                Join ArtVerse to discover and share amazing artworks
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegisterSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="username"
                    value={registerData.username}
                    onChange={(e) => 
                      setRegisterData({ ...registerData, username: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={(e) => 
                      setRegisterData({ ...registerData, email: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => 
                      setRegisterData({ ...registerData, password: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => 
                      setRegisterData({ ...registerData, confirmPassword: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">I am a...</Label>
                  <Select
                    value={registerData.role}
                    onValueChange={(value: "visitor" | "artist" | "admin") => 
                      setRegisterData({ ...registerData, role: value })
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visitor">Art Enthusiast</SelectItem>
                      <SelectItem value="artist">Artist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {registerError && (
                  <p className="text-red-500 text-sm">{registerError}</p>
                )}
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthForms;
