import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package } from "lucide-react";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export default function Products() {
  const { data: productsList, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="page-products">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-products-title">Products & Access</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage platform products. Assign product access per organization from their billing detail page.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {productsList?.map((product) => (
          <Card key={product.id} data-testid={`card-product-${product.slug}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {product.name}
              </CardTitle>
              <Badge variant="secondary" data-testid={`badge-product-slug-${product.slug}`}>
                {product.slug}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground" data-testid={`text-product-desc-${product.slug}`}>
                {product.description || "No description"}
              </p>
            </CardContent>
          </Card>
        ))}

        {(!productsList || productsList.length === 0) && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No products configured
          </div>
        )}
      </div>
    </div>
  );
}
