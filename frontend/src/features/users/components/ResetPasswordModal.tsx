import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useResetUserPassword } from "@/features/users/api/useUsers";
import type { User } from "@/types/user";

interface ResetPasswordModalProps {
  user: User | null;
  onClose: () => void;
}

export function ResetPasswordModal({ user, onClose }: ResetPasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const resetPassword = useResetUserPassword();

  useEffect(() => {
    setPassword("");
    setConfirmPassword("");
    resetPassword.reset();
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- only reset fields when the target user changes, not on every mutation object re-render
  }, [user]);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const tooShort = password.length > 0 && password.length < 8;
  const canSubmit = password.length >= 8 && password === confirmPassword;

  function handleSubmit() {
    if (!user || !canSubmit) return;
    resetPassword.mutate(
      { id: user.id, password },
      { onSuccess: () => onClose() },
    );
  }

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title="Reset Password"
      description={user ? `Atur ulang password untuk ${user.full_name}.` : undefined}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button disabled={!canSubmit || resetPassword.isPending} onClick={handleSubmit}>
            {resetPassword.isPending ? "Menyimpan..." : "Reset Password"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {resetPassword.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            Gagal mereset password. Coba lagi.
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Password Baru</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
          />
          {tooShort && <p className="mt-1 text-xs text-red-600">Password minimal 8 karakter.</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">Konfirmasi Password</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password baru"
          />
          {mismatch && <p className="mt-1 text-xs text-red-600">Password tidak cocok.</p>}
        </div>
      </div>
    </Modal>
  );
}
