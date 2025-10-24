import { AuthForm } from '@/components/auth/AuthForm'

export default async function SignInPage({ params }: { params: Promise<{ redirect: string }> }) {
  const props = await params;
  return (
    <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full flex items-center">
        <AuthForm isLogin={true} isResetting={false} redirect={props.redirect} />
      </div>
    </div>
  )
}
