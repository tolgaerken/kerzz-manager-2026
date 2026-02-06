import { useState } from "react";
import { Mail, MessageSquare, Edit, Eye, RefreshCw } from "lucide-react";
import { useNotificationTemplates } from "../../hooks";
import type { NotificationTemplate, NotificationChannel } from "../../types";
import { TemplateEditorModal } from "../TemplateEditorModal";
import { TemplatePreviewModal } from "../TemplatePreviewModal";

interface TemplateListProps {
  channel: NotificationChannel;
}

export function TemplateList({ channel }: TemplateListProps) {
  const { data, isLoading, refetch } = useNotificationTemplates({ channel });
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handlePreview = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setSelectedTemplate(null);
  };

  const handleEditorSuccess = () => {
    refetch();
    handleEditorClose();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-[var(--color-muted)]" />
      </div>
    );
  }

  const templates = data?.data || [];

  return (
    <div className="space-y-4">
      {templates.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-[var(--color-muted)]">
          Bu kanal için şablon bulunamadı.
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template._id}
              className="bg-[var(--color-surface-elevated)] rounded-lg p-4 border border-[var(--color-border)]"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      template.channel === "email"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                        : "bg-green-100 dark:bg-green-900/30 text-green-600"
                    }`}
                  >
                    {template.channel === "email" ? (
                      <Mail className="w-5 h-5" />
                    ) : (
                      <MessageSquare className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--color-foreground)]">
                      {template.name}
                    </h4>
                    <p className="text-sm text-[var(--color-muted)]">
                      {template.code}
                    </p>
                    {template.description && (
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {template.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.variables.map((variable) => (
                        <span
                          key={variable}
                          className="px-2 py-0.5 text-xs bg-[var(--color-surface)] rounded text-[var(--color-muted)]"
                        >
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      template.isActive
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800"
                    }`}
                  >
                    {template.isActive ? "Aktif" : "Pasif"}
                  </span>
                  <button
                    onClick={() => handlePreview(template)}
                    className="p-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface)] rounded-md transition-colors"
                    title="Önizle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface)] rounded-md transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTemplate && (
        <>
          <TemplateEditorModal
            isOpen={isEditorOpen}
            template={selectedTemplate}
            onClose={handleEditorClose}
            onSuccess={handleEditorSuccess}
          />
          <TemplatePreviewModal
            isOpen={isPreviewOpen}
            template={selectedTemplate}
            onClose={handlePreviewClose}
          />
        </>
      )}
    </div>
  );
}
