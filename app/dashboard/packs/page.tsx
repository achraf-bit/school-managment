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
import { useLanguage } from "@/components/language-provider";

type Pack = {
  id: string;
  name: string;
  discountPercentage: number;
  status: string;
  packClasses: { class: { id: string; name: string } }[];
};

export default function PacksPage() {
  const { t } = useLanguage();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [filteredPacks, setFilteredPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPack, setEditPack] = useState<Pack | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadPacks = () => {
    fetch("/api/packs").then((res) => res.json()).then((data) => {
      if (data.success) { setPacks(data.data); setFilteredPacks(data.data); }
      setLoading(false);
    });
  };

  const toggleStatus = async (packId: string, currentStatus: string) => {
    await fetch(`/api/packs/${packId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: currentStatus === "active" ? "inactive" : "active" }),
    });
    loadPacks();
  };

  const deletePack = async (packId: string) => {
    if (!confirm(t("confirm"))) return;
    await fetch(`/api/packs/${packId}`, { method: "DELETE" });
    loadPacks();
  };

  useEffect(() => {
    let result = packs;
    if (searchTerm) result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (statusFilter !== "all") result = result.filter(p => p.status === statusFilter);
    setFilteredPacks(result);
  }, [searchTerm, statusFilter, packs]);

  useEffect(() => { loadPacks(); }, []);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">{t("packs")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("managePacks")}</p>
        </div>
        <PackFormDialog onSuccess={loadPacks} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("allPacks")}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("searchPacks")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t("filterByStatus")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStatus")}</SelectItem>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="inactive">{t("inactive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <p>{t("loading")}</p> : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("discount")}</TableHead>
                      <TableHead>{t("classes")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPacks.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("noPacks")}</TableCell></TableRow>
                    ) : filteredPacks.map((pack) => (
                      <TableRow key={pack.id}>
                        <TableCell className="font-medium">{pack.name}</TableCell>
                        <TableCell>{pack.discountPercentage}%</TableCell>
                        <TableCell>{pack.packClasses.length} {t("classes")}</TableCell>
                        <TableCell><Badge variant={pack.status === "active" ? "default" : "secondary"}>{t(pack.status as any)}</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setEditPack(pack); setEditDialogOpen(true); }}><Pencil className="mr-2 h-4 w-4" />{t("edit")}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleStatus(pack.id, pack.status)} className={pack.status === "active" ? "text-red-600" : "text-green-600"}>
                                {pack.status === "active" ? <><Ban className="mr-2 h-4 w-4" />{t("deactivate")}</> : <><CheckCircle className="mr-2 h-4 w-4" />{t("activate")}</>}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deletePack(pack.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />{t("delete")}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden space-y-3">
                {filteredPacks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">{t("noPacks")}</p>
                ) : filteredPacks.map((pack) => (
                  <Card key={pack.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-base">{pack.name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p>{t("discount")}: {pack.discountPercentage}%</p>
                          <p>{t("classes")}: {pack.packClasses.length}</p>
                        </div>
                        <div className="mt-2"><Badge variant={pack.status === "active" ? "default" : "secondary"}>{t(pack.status as any)}</Badge></div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditPack(pack); setEditDialogOpen(true); }}><Pencil className="mr-2 h-4 w-4" />{t("edit")}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleStatus(pack.id, pack.status)} className={pack.status === "active" ? "text-red-600" : "text-green-600"}>
                            {pack.status === "active" ? <><Ban className="mr-2 h-4 w-4" />{t("deactivate")}</> : <><CheckCircle className="mr-2 h-4 w-4" />{t("activate")}</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deletePack(pack.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />{t("delete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {editPack && (
        <PackFormDialog pack={editPack} open={editDialogOpen}
          onOpenChange={(open) => { setEditDialogOpen(open); if (!open) setEditPack(null); }}
          onSuccess={() => { loadPacks(); setEditDialogOpen(false); setEditPack(null); }}
        />
      )}
    </div>
  );
}
