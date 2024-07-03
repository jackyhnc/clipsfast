import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"



export default function SignUpCard() {

    return (
        <div className="bg-[var(--primary-bgcolor)]">
            <CardHeader>
                <div className="mx-4 flex flex-col items-center gap-3">
                    <CardTitle>Register an account</CardTitle>
                    <CardDescription>Enter your email to sign in to your account</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Input
                            id="email"
                            placeholder="Email"
                        />
                        <Input
                            id="password"
                            placeholder="Password"
                        />
                        <Button>
                            Continue
                        </Button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                    </div>
                    <Button variant="secondary">
                        <div className="flex gap-3">
                            <img 
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1920px-Google_%22G%22_logo.svg.png?20230822192911" 
                                alt="Google Logo" 
                                className="size-5"
                            />
                            <div className="">Google</div>
                        </div>
                    </Button>
                    
                </form>
            </CardContent>
        </div>
    )
}