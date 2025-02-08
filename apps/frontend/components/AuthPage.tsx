export function AuthPage({isSignin}:{isSignin: boolean}){
    return <div className="w-screen h-screen flex justify-center items-center">
        <div className="p-4 m-2 rounded flex flex-col gap-2 bg-gray-600">
            <input type="text" className="px-3 py-2" placeholder="Enter your email"/>
            <input type="password" className="px-3 py-2" placeholder="Enter your password"/>
            <button className="bg-blue-500 py-2 rounded text-white">{isSignin ? "Signin" : "Signup"}</button>
        </div>
    </div>
}