import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendOtp = async () => {
    console.log("SEND OTP CLICKED");
    
    if (!email) {
      alert("Please enter email");
      return;
    }

    setIsLoading(true);

    try {
      await fetch("https://kredyble-admin-portal.onrender.com/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      alert("OTP sent");
      setStep(2);
    } catch (err) {
      alert("Error sending OTP");
    }

    setIsLoading(false);
  };

  const resetPassword = async () => {
    if (!otp || !password) {
      alert("Enter OTP and new password");
      return;
    }

    setIsLoading(true);

    try {
      await fetch("https://YOUR_BACKEND_URL/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          new_password: password,
        }),
      });

      alert("Password reset successful");
      window.location.href = "/";
    } catch (err) {
      alert("Error resetting password");
    }

    setIsLoading(false);
  };

  return (
    <div className="login-container">
      <Card className="w-full max-w-md">
        
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Kredyble
          </CardTitle>
          <CardDescription>
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="button" className="w-full" onClick={sendOtp} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>OTP</Label>
                <Input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={resetPassword} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </>
          )}

          <div className="text-center text-sm text-slate-500">
            <a href="/" className="hover:text-slate-900">
              Back to login
            </a>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
