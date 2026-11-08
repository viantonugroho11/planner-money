"use client";
import { PageLoading } from "@/components/ui/page-loading";
import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Trash2, Check, X, Crown, UserPlus, Home } from "lucide-react";
import * as db from "@/lib/db";
import type { Household, HouseholdMember } from "@/lib/types";

type PendingInvite = HouseholdMember & { householdName: string };

export default function FamilyPage() {
  const [loading, setLoading] = useState(true);
  const [myHousehold, setMyHousehold] = useState<Household | null>(null);
  const [memberHousehold, setMemberHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [creating, setCreating] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mine, invites] = await Promise.all([
        db.getMyHousehold(),
        db.getPendingInvites(),
      ]);
      setMyHousehold(mine);
      setPendingInvites(invites);
      if (mine) {
        const m = await db.getHouseholdMembers(mine.id);
        setMembers(m);
      } else {
        const memberOf = await db.getHouseholdImMemberOf();
        setMemberHousehold(memberOf);
        if (memberOf) {
          const m = await db.getHouseholdMembers(memberOf.id);
          setMembers(m);
        }
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function flash(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3500);
  }

  async function handleCreate() {
    if (!householdName.trim()) return;
    try {
      const h = await db.createHousehold(householdName.trim());
      setMyHousehold(h);
      setMembers([]);
      setCreating(false);
      setHouseholdName("");
      flash("Keluarga berhasil dibuat.");
    } catch (e) { setError((e as Error).message); }
  }

  async function handleInvite() {
    if (!inviteEmail.trim() || !myHousehold) return;
    setInviting(true);
    try {
      const m = await db.inviteMember(myHousehold.id, inviteEmail.trim().toLowerCase());
      setMembers((prev) => [...prev, m]);
      setInviteEmail("");
      flash(`Undangan dikirim ke ${m.invitedEmail}`);
    } catch (e) { setError((e as Error).message); }
    finally { setInviting(false); }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      await db.removeMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (e) { setError((e as Error).message); }
  }

  async function handleRespond(inviteId: string, accept: boolean) {
    try {
      await db.respondToInvite(inviteId, accept);
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
      flash(accept ? "Kamu sudah bergabung ke keluarga." : "Undangan ditolak.");
      if (accept) load();
    } catch (e) { setError((e as Error).message); }
  }

  async function handleDeleteHousehold() {
    if (!myHousehold) return;
    if (!confirm("Hapus keluarga ini? Semua anggota akan dikeluarkan dan ini tidak bisa dibatalkan.")) return;
    try {
      await db.deleteHousehold(myHousehold.id);
      setMyHousehold(null);
      setMembers([]);
      flash("Keluarga dihapus.");
    } catch (e) { setError((e as Error).message); }
  }

  const activeMembers = members.filter((m) => m.status === "active");
  const pendingMembers = members.filter((m) => m.status === "pending");

  if (loading) return <PageLoading />;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Akun Keluarga</h1>
        <p className="text-sm text-muted-foreground">Undang anggota keluarga untuk berbagi keuangan</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-2 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-2 text-sm">{success}</div>
      )}

      {/* Pending invites for this user */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4 text-primary" /> Undangan Masuk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingInvites.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between bg-secondary rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">{inv.householdName}</p>
                  <p className="text-xs text-muted-foreground">Kamu diundang sebagai anggota</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleRespond(inv.id, true)}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Terima
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleRespond(inv.id, false)}>
                    <X className="h-3.5 w-3.5 mr-1" /> Tolak
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Member of someone else's household */}
      {!myHousehold && memberHousehold && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Home className="h-4 w-4 text-primary" /> {memberHousehold.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Kamu anggota keluarga ini.</p>
            <div className="space-y-2">
              {activeMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 bg-secondary rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{m.invitedEmail ?? m.userId}</p>
                    <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                  </div>
                  {m.role === "owner" && <Crown className="h-4 w-4 text-yellow-400" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Owner: manage household */}
      {myHousehold && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-4 w-4 text-yellow-400" /> {myHousehold.name}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleDeleteHousehold}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Invite form */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Undang anggota via email:</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  placeholder="email@contoh.com"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                />
                <Button size="sm" onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                  <Plus className="h-4 w-4 mr-1" /> Undang
                </Button>
              </div>
            </div>

            {/* Active members */}
            {activeMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Anggota Aktif</p>
                {activeMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 bg-secondary rounded-lg p-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{m.invitedEmail ?? m.userId}</p>
                      <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(m.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Pending invites */}
            {pendingMembers.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Menunggu Konfirmasi</p>
                {pendingMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3 opacity-70">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{m.invitedEmail}</p>
                      <p className="text-xs text-muted-foreground">Menunggu konfirmasi</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(m.id)}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {activeMembers.length === 0 && pendingMembers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">Belum ada anggota. Masukkan email untuk mengundang.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* No household */}
      {!myHousehold && !memberHousehold && pendingInvites.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Users className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium">Belum ada keluarga</p>
              <p className="text-sm text-muted-foreground mt-1">Buat keluarga, lalu undang pasangan atau anggota lain lewat email.</p>
            </div>
            {creating ? (
              <div className="flex gap-2 max-w-sm mx-auto">
                <input
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="Nama keluarga, mis. Keluarga Budi"
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
                  autoFocus
                />
                <Button size="sm" onClick={handleCreate} disabled={!householdName.trim()}>Buat</Button>
                <Button variant="outline" size="sm" onClick={() => setCreating(false)}>Batal</Button>
              </div>
            ) : (
              <Button onClick={() => setCreating(true)}>
                <Plus className="h-4 w-4 mr-2" /> Buat keluarga
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
