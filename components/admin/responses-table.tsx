"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye } from "lucide-react"
import type { Response, Question } from "@/lib/types"

interface ResponsesTableProps {
  responses: Response[]
  questions: Question[]
}

export function ResponsesTable({ responses, questions }: ResponsesTableProps) {
  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">No responses yet. Share your form to start collecting data.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Submitted</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Answers</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {responses.map((response) => (
          <TableRow key={response.id}>
            <TableCell>{new Date(response.submitted_at).toLocaleString()}</TableCell>
            <TableCell>{response.respondent_email || "Anonymous"}</TableCell>
            <TableCell>{Object.keys(response.answers).length} answers</TableCell>
            <TableCell className="text-right">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Response Details</DialogTitle>
                    <DialogDescription>
                      Submitted on {new Date(response.submitted_at).toLocaleString()}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div key={question.id} className="space-y-1">
                        <p className="font-medium">{question.question_text}</p>
                        <p className="text-sm text-muted-foreground">
                          {response.answers[question.id] !== undefined
                            ? Array.isArray(response.answers[question.id])
                              ? response.answers[question.id].join(", ")
                              : String(response.answers[question.id])
                            : "No answer"}
                        </p>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
