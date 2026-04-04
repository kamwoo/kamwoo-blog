'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <button
      onClick={handleLogout}
      className='text-sm text-muted-foreground hover:text-foreground transition-colors'
    >
      로그아웃
    </button>
  );
}
