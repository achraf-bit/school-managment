"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type Member = { id: string; name: string; email: string; role: string; createdAt: string };

export default function MembersPage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const currentUser = session?.user as any;
  const isAdmin = currentUser?.role === "admin";

  const [members, setMembers] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const loadMembers = () => {
    fetch("/api/members").then((res) => res.json()).then((data) => { if (data.success) setMembers(data.data); });
  };

  useEffect(() => { loadMembers(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const res = await fetch("/api/members", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (data.success) { setOpen(false); setForm({ name: "", email: "", password: "" }); loadMembers(); }
    else setError(data.error?.message || "Failed to add member");
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{t("members")}</CardTitle>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-2 h-4 w-4" />{t("addMember")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{t("addMember")}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>{t("name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div><Label>{t("email")}</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
                <div><Label>{t("password")}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={loading} className="w-full">{loading ? t("adding") : t("addMember")}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("joined")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.name}
                    {member.email === currentUser?.email && <span className="ml-2 text-xs text-muted-foreground">({t("you")})</span>}
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell><Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge></TableCell>
                  <TableCell>{new Date(member.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden space-y-3">
          {members.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">
                    {member.name}
                    {member.email === currentUser?.email && <span className="ml-2 text-xs text-muted-foreground">({t("you")})</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{member.email}</p>
                  <p className="text-sm text-muted-foreground">{t("joined")}: {new Date(member.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
