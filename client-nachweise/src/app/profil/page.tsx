import { Profile } from "@/features/auth/Profile";

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
