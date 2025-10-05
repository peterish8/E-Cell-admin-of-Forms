"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Download, Database, Trash2 } from "lucide-react"

export function QuickActions() {
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const exportAllData = async () => {
    setLoading("export")
    setMessage(null)
    
    try {
      const supabase = createClient()
      const { data: submissions } = await supabase.from("submissions").select("*")
      
      // Export only response data in CSV format
      const csvHeaders = "Email,Form ID,Submitted At,Answers\n"
      const csvRows = (submissions || []).map(sub => 
        `"${sub.email || 'Anonymous'}","${sub.form_id}","${sub.created_at}","${JSON.stringify(sub.answers).replace(/"/g, '""')}"`
      ).join("\n")
      
      const csvContent = csvHeaders + csvRows
      const filename = `responses-export-${new Date().toISOString().split('T')[0]}.csv`
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setMessage(`✅ ${submissions?.length || 0} responses exported to CSV!`)
    } catch (error) {
      setMessage("❌ Export failed")
    } finally {
      setLoading(null)
    }
  }

  const systemBackup = async () => {
    setLoading("backup")
    setMessage(null)
    
    try {
      const supabase = createClient()
      const { data: forms } = await supabase.from("ecell_forms").select("*")
      const { data: questions } = await supabase.from("ecell_questions").select("*")
      const { data: submissions } = await supabase.from("submissions").select("*")
      
      const backupData = {
        backup_date: new Date().toISOString(),
        version: "1.0.0",
        tables: {
          ecell_forms: forms || [],
          ecell_questions: questions || [],
          submissions: submissions || []
        }
      }
      
      const filename = `ecell-backup-${Date.now()}.json`
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setMessage("✅ Backup created successfully!")
    } catch (error) {
      setMessage("❌ Backup failed")
    } finally {
      setLoading(null)
    }
  }

  const clearCache = async () => {
    setLoading("cache")
    setMessage(null)
    
    try {
      // Clear browser cache
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
      
      // Reload the page to clear Next.js cache
      window.location.reload()
      
      setMessage("✅ Cache cleared successfully!")
    } catch (error) {
      setMessage("❌ Cache clear failed")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      <Button 
        variant="outline" 
        className="w-full justify-start" 
        onClick={exportAllData}
        disabled={loading === "export"}
      >
        <Download className="mr-2 h-4 w-4" />
        {loading === "export" ? "Exporting..." : "Export Responses (CSV)"}
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start" 
        onClick={systemBackup}
        disabled={loading === "backup"}
      >
        <Database className="mr-2 h-4 w-4" />
        {loading === "backup" ? "Creating Backup..." : "System Backup"}
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full justify-start" 
        onClick={clearCache}
        disabled={loading === "cache"}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {loading === "cache" ? "Clearing..." : "Clear Cache"}
      </Button>
      
      {message && (
        <div className="text-sm p-2 rounded bg-muted">
          {message}
        </div>
      )}
    </div>
  )
}