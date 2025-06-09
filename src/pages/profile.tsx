import { Profile } from "~/components/profile/Profile";
import { Navbar } from "~/components/layout/Navbar";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Profile session={session} />
    </div>
  );
}
