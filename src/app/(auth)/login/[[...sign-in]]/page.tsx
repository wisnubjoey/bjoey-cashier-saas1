import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Login to SaaS Cashier</h1>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-black hover:bg-gray-800 text-white',
              footerActionLink: 'text-black hover:text-gray-800'
            }
          }}
        />
      </div>
    </div>
  );
}
