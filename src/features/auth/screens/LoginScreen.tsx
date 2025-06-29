export function LoginScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4">
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-card-foreground">Welcome to DJEI</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 font-semibold"
          >
            Sign In
          </button>
        </form>
        <div className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-400 hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  )
}
