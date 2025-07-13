/* src/lib/useToast.tsx  – very small helper */
import { toast } from "sonner"              // already installed by shadcn
export function toastError(msg: string) { toast.error(msg) }
export function toastSuccess(msg: string) { toast.success(msg) }
