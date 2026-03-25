import { useState } from "react";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const sendOtp = async () => {
    try {
      await fetch("https://kredyble-admin-portal.onrender.com/forgot-password", {
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
  };

  const resetPassword = async () => {
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
  };

  return (
    <div style={{ padding: 20 }}>
      {step === 1 && (
        <>
          <h2>Forgot Password</h2>
          <input
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />
          <button onClick={sendOtp}>Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2>Reset Password</h2>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <br /><br />
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br /><br />
          <button onClick={resetPassword}>Reset Password</button>
        </>
      )}
    </div>
  );
}
