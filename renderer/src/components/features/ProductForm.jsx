import { useMemo } from "react";
import { Field, Input, NumberInput } from "../ui/Input";

// Shared form used by AddProduct and EditProduct.
// Net weight is computed live from gross - stone (the jewelry convention).
export function ProductForm({ value, onChange, disabled = false }) {
  const netWeight = useMemo(() => {
    const g = Number(value.gross_weight) || 0;
    const s = Number(value.stone_weight) || 0;
    return Math.max(0, g - s);
  }, [value.gross_weight, value.stone_weight]);

  function set(field, v) {
    onChange({ ...value, [field]: v });
  }

  return (
    <div className="space-y-6">
      {/* Identity */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Item Name *">
          <Input
            value={value.name || ""}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. 22kt Gold Bangle"
            required
            disabled={disabled}
          />
        </Field>
        <Field label="Purity">
          <Input
            value={value.purity || ""}
            onChange={(e) => set("purity", e.target.value)}
            placeholder="e.g. 22K, 916, 18K"
            disabled={disabled}
          />
        </Field>
      </section>

      {/* Weights */}
      <section>
        <div className="label-tag text-primary-500 mb-3">Weights</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Gross Weight (g) *" hint="Total weight (gold + stones)">
            <NumberInput
              value={value.gross_weight ?? ""}
              onChange={(e) => set("gross_weight", e.target.value)}
              required
              disabled={disabled}
            />
          </Field>
          <Field label="Stone Weight (g)">
            <NumberInput
              value={value.stone_weight ?? ""}
              onChange={(e) => set("stone_weight", e.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Net Weight (g)" hint="Auto = Gross − Stone">
            <Input value={netWeight.toFixed(3)} readOnly disabled />
          </Field>
        </div>
      </section>

      {/* Purchase side */}
      <section>
        <div className="label-tag text-primary-500 mb-3">Purchase details</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Field label="Buying Cost">
            <NumberInput
              value={value.buying_cost ?? ""}
              onChange={(e) => set("buying_cost", e.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Bore Rate">
            <NumberInput
              value={value.bore_rate ?? ""}
              onChange={(e) => set("bore_rate", e.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Supplier">
            <Input
              value={value.supplier_name || ""}
              onChange={(e) => set("supplier_name", e.target.value)}
              disabled={disabled}
            />
          </Field>
        </div>
      </section>

      {/* Sale side */}
      <section>
        <div className="label-tag text-primary-500 mb-3">Sale details (used by Billing)</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Price per gram">
            <NumberInput
              value={value.price_per_gram ?? ""}
              onChange={(e) => set("price_per_gram", e.target.value)}
              disabled={disabled}
            />
          </Field>
          <Field label="Making Charge">
            <NumberInput
              value={value.making_charge ?? ""}
              onChange={(e) => set("making_charge", e.target.value)}
              disabled={disabled}
            />
          </Field>
        </div>
      </section>
    </div>
  );
}

export function emptyProduct() {
  return {
    name: "",
    purity: "",
    gross_weight: "",
    stone_weight: "0",
    buying_cost: "",
    bore_rate: "",
    supplier_name: "",
    price_per_gram: "",
    making_charge: "",
  };
}
