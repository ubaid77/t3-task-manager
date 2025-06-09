import { GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";
import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          <div>
            <Button
              onClick={() => signIn("email")}
              className="w-full justify-center"
            >
              Sign in with Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
