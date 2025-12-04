import type { Metadata } from 'next';
import UserView from "@/features/user/UserView";

export const metadata: Metadata = {
  title: 'Benutzer erstellen',
};

export default function UserErstellenPage() {
  return (
    <>
       <UserView />
    </>
  );
}