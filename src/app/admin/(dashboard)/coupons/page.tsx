import { getCoupons } from "./actions";
import CouponsManager from "@/components/admin/CouponsManager";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Coupons</h1>
          <p className="text-muted-foreground mt-2">Manage discount codes for your customers.</p>
        </div>
      </div>

      <CouponsManager initialCoupons={coupons} />
    </div>
  );
}
