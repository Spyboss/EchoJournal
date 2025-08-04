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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSignUp();
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit">Sign Up</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SignUp;