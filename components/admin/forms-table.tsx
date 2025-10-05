"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Link as LinkIcon, Copy } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface FormWithStats {
  id: string
  name: string
  description: string | null
  is_active: boolean
  custom_slug: string | null
  created_at: string
  response_count: number
}

export function FormsTable({ forms }: { forms: FormWithStats[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form? This action cannot be undone.")) {
      return
    }

    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from("ecell_forms").delete().eq("id", id)

    if (error) {
      alert("Error deleting form: " + error.message)
    } else {
      router.refresh()
    }
    setDeletingId(null)
  }

  const copyFormUrl = (form: FormWithStats) => {
    const slug = form.custom_slug || form.id
    const url = `https://ecell-forms.vercel.app/form/${slug}`
    navigator.clipboard.writeText(url)
    alert("Form URL copied to clipboard!")
  }

  const getFormUrl = (form: FormWithStats) => {
    return form.custom_slug || form.id
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
  }

  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No forms yet. Create your first form to get started.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Form Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Responses</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {forms.map((form) => (
          <TableRow key={form.id}>
            <TableCell className="font-medium">
              <div>
                <div>{form.name}</div>
                {form.description && <div className="text-sm text-muted-foreground">{form.description}</div>}
                {form.is_active && (
                  <div className="text-xs text-blue-600 mt-1">
                    https://ecell-forms.vercel.app/form/{getFormUrl(form)}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className={getStatusColor(form.is_active)}>
                {form.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>{form.response_count}</TableCell>
            <TableCell>
              {new Date(form.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={deletingId === form.id}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/forms/${form.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Form
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/forms/${form.id}/responses`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Responses
                    </Link>
                  </DropdownMenuItem>
                  {form.is_active && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={`/form/${getFormUrl(form)}`} target="_blank">
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Open Form
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => copyFormUrl(form)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Form URL
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem onClick={() => handleDelete(form.id)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
