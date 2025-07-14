'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');
  const { role } = useAuth();
  const router = useRouter();
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'USER' | 'ADMIN'>('USER');

  useEffect(() => {
    if (role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const response = await fetch('/api/users');
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    }
    setLoading(false);
  }

  async function updateRole(userId: string, newRole: 'USER' | 'ADMIN') {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (!error) fetchUsers();
  }

  async function createUser() {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
    });
    if (response.ok) {
      setNewEmail('');
      setNewPassword('');
      setNewRole('USER');
      fetchUsers();
    }
  }

  async function deleteUser(userId: string) {
    const response = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (response.ok) fetchUsers();
  }

  function openEdit(user: Profile) {
    setEditUser(user);
    setEditEmail(user.email);
    setEditRole(user.role as 'USER' | 'ADMIN');
  }

  async function updateUser() {
    if (!editUser) return;
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: editUser.id, email: editEmail, role: editRole }),
    });
    if (response.ok) {
      setEditUser(null);
      fetchUsers();
    }
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Label>Role</Label>
          <Select value={newRole.toLowerCase()} onValueChange={(value) => setNewRole(value.toUpperCase() as 'USER' | 'ADMIN')}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={createUser} className="mt-4">Create User</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select value={user.role?.toLowerCase()} onValueChange={(value) => updateRole(user.id, value.toUpperCase() as 'USER' | 'ADMIN')}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => openEdit(user)}>Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                      </DialogHeader>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input id="edit-email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                      <Label>Role</Label>
                      <Select value={editRole.toLowerCase()} onValueChange={(value) => setEditRole(value.toUpperCase() as 'USER' | 'ADMIN')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={updateUser}>Save</Button>
                    </DialogContent>
                  </Dialog>
                  <Button variant="destructive" onClick={() => deleteUser(user.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}