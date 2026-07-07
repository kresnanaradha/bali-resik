import { useMutation } from "@tanstack/react-query";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password, rememberMe }: LoginInput) => {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return credential.user;
    },
  });
}
