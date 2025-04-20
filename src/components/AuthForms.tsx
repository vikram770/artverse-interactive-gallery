import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

const AuthForms = () => {
  const navigate = useNavigate();
  const { register, login, isLoading, error } = useAuthStore();
  
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "visitor",
  });
  
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  
  const [isRegistering, setIsRegistering] = useState(false);
  
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };
  
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!registerData.username.trim()) {
      toast.error("Username is required");
      return;
    }
    
    if (!registerData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    
    if (!registerData.password.trim()) {
      toast.error("Password is required");
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    // Register user
    try {
      await register({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
      });
      
      // Redirect to profile page after successful registration
      navigate("/profile");
    } catch (error) {
      // Error is handled by the store
    }
  };
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!loginData.email.trim()) {
      toast.error("Email is required");
      return;
    }
    
    if (!loginData.password.trim()) {
      toast.error("Password is required");
      return;
    }
    
    // Login user
    try {
      await login(loginData.email, loginData.password);
      
      // Redirect to profile page after successful login
      navigate("/profile");
    } catch (error) {
      // Error is handled by the store
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <h1 className="text-2xl font-bold">
              {isRegistering ? "Create an account" : "Welcome back"}
            </h1>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-100 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {isRegistering ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    type="text"
                    id="register-username"
                    name="username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    placeholder="Enter your username"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    type="email"
                    id="register-email"
                    name="email"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    type="password"
                    id="register-password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                  <Input
                    type="password"
                    id="register-confirm-password"
                    name="confirmPassword"
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="register-role">Role</Label>
                  <select
                    id="register-role"
                    name="role"
                    value={registerData.role}
                    onChange={handleRegisterChange}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  >
                    <option value="visitor">Visitor</option>
                    <option value="artist">Artist</option>
                  </select>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setIsRegistering(false)}
                    disabled={isLoading}
                  >
                    Already have an account? Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    type="email"
                    id="login-email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    type="password"
                    id="login-password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setIsRegistering(true)}
                    disabled={isLoading}
                  >
                    Don't have an account? Register
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthForms;
