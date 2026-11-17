import { useSignUpMutation } from "../model/useSignUpMutation";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { router } from "expo-router";
import { useForm } from "react-hook-form";

import { ApiError } from "@/shared/api";
import { toFormErrors } from "@/shared/lib";
import { SignUpFormData, signUpSchema } from "../model/sign-up.schema";
import { SignUp } from "./SignUp";

export function SignUpForm() {
  const signUpMutation = useSignUpMutation();
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: standardSchemaResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      dateOfBirth: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await signUpMutation.mutateAsync(data);
      router.replace("/(main)/events");
    } catch (err) {
      if (ApiError.is(err, 409)) {
        setError("email", { message: err.message });
        return;
      }
      const { fields, root } = toFormErrors(err, [
        "name",
        "email",
        "password",
        "dateOfBirth",
      ] as const);
      for (const [name, message] of Object.entries(fields)) {
        setError(name as keyof SignUpFormData, { message });
      }
      if (root) setError("root", { message: root });
    }
  };

  return (
    <SignUp
      control={control}
      errors={errors}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
      onNavigateSignIn={() => router.push("/sign-in")}
    />
  );
}
