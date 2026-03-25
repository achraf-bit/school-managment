"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, X, Check } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { t } = useLanguage();
  const user = session?.user as any;

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleEditName = () => { setName(user?.name || ""); setNameError(""); setEditingName(true); };

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setNameLoading(true); setNameError("");
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    const data = await res.json();
    if (data.success) { await update({ name: data.data.name }); setEditingName(false); }
    else setNameError(data.error?.message || "Failed to update name");
    setNameLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPasswordError(""); setPasswordSuccess(false);
    if (passwords.new !== passwords.confirm) { setPasswordError("New passwords do not match"); return; }
    setPasswordLoading(true);
    const res = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }) });
    const data = await res.json();
    if (data.success) { setPasswords({ current: "", new: "", confirm: "" }); setChangingPassword(false); setPasswordSuccess(true); }
    else setPasswordError(data.error?.message || "Failed to change password");
    setPasswordLoading(false);
  };

  return (
    <div className="max-w-lg space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">{t("profile")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{t("name")}</p>
              {editingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8" autoFocus />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={handleSaveName} disabled={nameLoading}><Check className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setEditingName(false)}><X className="h-4 w-4" /></Button>
                </div>
              ) : <p className="font-medium">{user?.name}</p>}
              {nameError && <p className="text-xs text-red-600 mt-1">{nameError}</p>}
            </div>
            {!editingName && <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleEditName}><Pencil className="h-4 w-4" /></Button>}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("email")}</p>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("role")}</p>
            <Badge variant={user?.role === "admin" ? "default" : "secondary"}>{user?.role}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">{t("password")}</CardTitle>
          {!changingPassword && (
            <Button size="sm" variant="outline" onClick={() => { setChangingPassword(true); setPasswordSuccess(false); }}>{t("changePasword")}</Button>
          )}
        </CardHeader>
        <CardContent>
          {!changingPassword ? (
            <p className="text-sm text-muted-foreground">{passwordSuccess ? t("passwordChanged") : "••••••••"}</p>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3" autoComplete="off">
              <div>
                <Label>{t("currentPassword")}</Label>
                <Input type="password" autoComplete="current-password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
              </div>
              <div>
                <Label>{t("newPassword")}</Label>
                <Input type="password" autoComplete="new-password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} required minLength={6} />
              </div>
              <div>
                <Label>{t("confirmNewPassword")}</Label>
                <Input type="password" autoComplete="new-password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required minLength={6} />
              </div>
              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={passwordLoading}>{passwordLoading ? t("saving") : t("save")}</Button>
                <Button type="button" size="sm" variant="outline" onClick={() => { setChangingPassword(false); setPasswordError(""); }}>{t("cancel")}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
