"use client"

import { useState } from "react"
import { Upload, FileText, Mic, Video, MonitorPlay } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"

interface FileUploadProps {
  onProcess?: (file: File | null, hasScreenShare: boolean) => void
}

export function FileUpload({ onProcess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [hasScreenShare, setHasScreenShare] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleProcess = async () => {
    setProcessing(true)
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    onProcess?.(file, hasScreenShare)
    setProcessing(false)
    setFile(null)
  }

  const getFileIcon = () => {
    if (!file) return Upload
    const type = file.type
    if (type.startsWith("audio/")) return Mic
    if (type.startsWith("video/")) return Video
    return FileText
  }

  const FileIcon = getFileIcon()

  return (
    <div
      className="border-4 border-border bg-card"
      style={{ boxShadow: "var(--brutal-shadow)" }}
    >
      <div className="border-b-4 border-border bg-secondary p-4">
        <h3 className="text-lg font-black text-secondary-foreground">
          Process Meeting Recording
        </h3>
        <p className="mt-1 text-sm font-medium text-secondary-foreground/70">
          Upload text, audio, or video files to extract tasks
        </p>
      </div>

      <div className="p-4">
        {/* Drop Zone */}
        <div
          className={`relative border-4 border-dashed ${
            dragOver ? "border-accent bg-accent/10" : "border-border"
          } p-8 transition-colors`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".txt,.pdf,.mp3,.wav,.mp4,.webm"
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
          <div className="flex flex-col items-center text-center">
            <div
              className="flex h-16 w-16 items-center justify-center border-2 border-border bg-muted"
              style={{ boxShadow: "var(--brutal-shadow-sm)" }}
            >
              <FileIcon className="h-8 w-8" />
            </div>
            {file ? (
              <div className="mt-4">
                <p className="font-bold">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <p className="font-bold">Drop your file here</p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Supported formats */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Supported:
          </span>
          {["TXT", "PDF", "MP3", "WAV", "MP4", "WEBM"].map((format) => (
            <span
              key={format}
              className="border-2 border-border bg-muted px-2 py-0.5 text-xs font-bold"
            >
              {format}
            </span>
          ))}
        </div>

        {/* Screen Share Checkbox */}
        <div className="mt-4 flex items-center gap-3">
          <Checkbox
            id="screenShare"
            checked={hasScreenShare}
            onCheckedChange={(checked) => setHasScreenShare(checked as boolean)}
            className="border-2 border-border"
          />
          <label
            htmlFor="screenShare"
            className="flex cursor-pointer items-center gap-2 font-medium"
          >
            <MonitorPlay className="h-4 w-4" />
            Screen share present (enable OCR)
          </label>
        </div>

        {/* Process Button */}
        <Button
          onClick={handleProcess}
          disabled={!file || processing}
          className="mt-6 w-full border-2 border-border py-6 font-bold transition-all hover:translate-x-0.5 hover:translate-y-0.5"
          style={{ boxShadow: "var(--brutal-shadow)" }}
        >
          {processing ? (
            <>
              <Spinner className="mr-2" />
              Processing Meeting...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Process Meeting
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
