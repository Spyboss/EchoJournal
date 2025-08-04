import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { signUp } = useAuth();

  const handleSignUp = async () => {
    setError(null); // Clear previous errors
    try {
      const { user, error } = await signUp(email, password);
      if (error) {
        setError(error.message);
        console.error('Error signing up:', error);
      } else {
        // Handle successful sign-up (e.g., redirect to dashboard)
        console.log('User signed up successfully!');
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Error signing up:', error);
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignUp}>Sign Up</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SignUp;