import type { Metadata } from 'next';
import { Profile } from "@/features/auth/Profile";

export const metadata: Metadata = {
  title: 'Profil',
};

export default function ProfilePage() {
  return (
    <div
      className="flex justify-center items-center h-full bg-cover bg-center"
      style={{ backgroundImage: "url('/background-pattern.svg')" }}
    >
      <Profile />
    </div>
  );
}