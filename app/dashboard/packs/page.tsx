"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackFormDialog } from "@/components/forms/pack-form-dialog";
import { Pencil, Search, MoreVertical, Ban, CheckCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Pack = {
  id: string;
  name: string;
  discountPercentage: number;
  status: string;
  packClasses: { class: { id: string; name: string } }[];
};

export default function PacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [filteredPacks, setFilteredPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPack, setEditPack] = useState<Pack | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadPacks = () => {
    fetch("/api/packs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPacks(data.data);
          setFilteredPacks(data.data);
        }
        setLoading(false);
      });
  };

  const toggleStatus = async (packId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await fetch(`/api/packs/${packId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadPacks();
  };

  const deletePack = async (packId: string) => {
    if (!confirm("Are you sure you want to delete this pack?")) return;
    await fetch(`/api/packs/${packId}`, { method: "DELETE" });
    loadPacks();
  };

  useEffect(() => {
    let result = packs;
    if (searchTerm) {
      result = result.filter(pack => 
        pack.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter(pack => pack.status === statusFilter);
    }
    setFilteredPacks(result);
  }, [searchTerm, statusFilter, packs]);

  useEffect(() => {
    loadPacks();
  }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Packs</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage class packs with discounts</p>
        </div>
        <PackFormDialog onSuccess={loadPacks} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Packs</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by pack name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Classes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPacks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No packs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPacks.map((pack) => (
                        <TableRow key={pack.id}>
                          <TableCell className="font-medium">{pack.name}</TableCell>
                          <TableCell>{pack.discountPercentage}%</TableCell>
                          <TableCell>{pack.packClasses.length} classes</TableCell>
                          <TableCell>
                            <Badge variant={pack.status === "active" ? "default" : "secondary"}>
                              {pack.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditPack(pack); setEditDialogOpen(true); }}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toggleStatus(pack.id, pack.status)} className={pack.status === "active" ? "text-red-600" : "text-green-600"}>
                                  {pack.status === "active" ? <><Ban className="mr-2 h-4 w-4" />Deactivate</> : <><CheckCircle className="mr-2 h-4 w-4" />Activate</>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deletePack(pack.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredPacks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No packs found</p>
                ) : (
                  filteredPacks.map((pack) => (
                    <Card key={pack.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-base">{pack.name}</h3>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>Discount: {pack.discountPercentage}%</p>
                            <p>Classes: {pack.packClasses.length}</p>
                          </div>
                          <div className="mt-2">
                            <Badge variant={pack.status === "active" ? "default" : "secondary"}>
                              {pack.status}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditPack(pack); setEditDialogOpen(true); }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleStatus(pack.id, pack.status)} className={pack.status === "active" ? "text-red-600" : "text-green-600"}>
                              {pack.status === "active" ? <><Ban className="mr-2 h-4 w-4" />Deactivate</> : <><CheckCircle className="mr-2 h-4 w-4" />Activate</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deletePack(pack.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {editPack && (
        <PackFormDialog
          pack={editPack}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setEditPack(null);
          }}
          onSuccess={() => {
            loadPacks();
            setEditDialogOpen(false);
            setEditPack(null);
          }}
        />
      )}
    </div>
  );
}
