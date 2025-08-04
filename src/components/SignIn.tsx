import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { signIn } = useAuth();

  const handleSignIn = async () => {
    setError(null); // Clear previous errors
    try {
      const { user, error } = await signIn(email, password);
      if (error) {
        setError(error.message);
        console.error('Error signing in:', error);
      } else {
        // Handle successful sign-in (e.g., redirect to dashboard)
        console.log('User signed in successfully!');
      }
    } catch (err: any) {
      // Handle errors
      setError(err.message);
      console.error('Error signing in:', err);
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
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
      <button onClick={handleSignIn}>Sign In</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SignIn;