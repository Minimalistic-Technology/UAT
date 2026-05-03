import { useFormContext } from "react-hook-form";
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileFormValues } from "@/validations";

export const BasicInfoTab = () => {
  const { register, formState: { errors } } = useFormContext<ProfileFormValues>();

  return (
    <TabsContent value="basic" className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>First Name</Label>
          <Input {...register("firstName")} />
          {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Last Name</Label>
          <Input {...register("lastName")} />
          {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input {...register("phone")} />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>City</Label>
          <Input {...register("location.city")} />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Input {...register("location.state")} />
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input {...register("location.country")} />
        </div>
      </div>
    </TabsContent>
  );
};
