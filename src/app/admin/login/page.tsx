'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || '로그인에 실패했습니다');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='w-full max-w-sm p-8 rounded-lg border border-border bg-card'>
        <h1 className='text-xl font-bold text-foreground mb-6'>Admin</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            type='password'
            placeholder='비밀번호'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full px-3 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'
            autoFocus
          />
          {error && <p className='text-sm text-destructive'>{error}</p>}
          <Button type='submit' disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>
      </div>
    </div>
  );
}
