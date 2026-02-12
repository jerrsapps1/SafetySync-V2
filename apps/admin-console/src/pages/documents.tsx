import { useState, useEffect } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  listDocuments,
  uploadDocument,
  getDocument,
  reviewDocument,
  approveDocument,
  rejectDocument,
  listEmployees,
} from "@/mock/api";
import type { MockDocument, MockEmployee } from "@/mock/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Documents() {
  const { t } = useI18n();
  const { activeOrg } = useOrganization();
  const { toast } = useToast();

  const [documents, setDocuments] = useState<MockDocument[]>([]);
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<MockDocument | null>(null);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [uploading, setUploading] = useState(false);

  const [courseName, setCourseName] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [oshaStandard, setOshaStandard] = useState("");
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docs, emps] = await Promise.all([
        listDocuments(activeOrg.id),
        listEmployees(activeOrg.id),
      ]);
      setDocuments(docs);
      setEmployees(emps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeOrg.id]);

  const handleUpload = async () => {
    setUploading(true);
    try {
      const fileName = `training_doc_${Date.now()}.pdf`;
      await uploadDocument(activeOrg.id, { fileName });
      await loadData();
      toast({ title: t("documents.upload"), description: fileName });
    } finally {
      setUploading(false);
    }
  };

  const openReviewDialog = async (doc: MockDocument) => {
    const freshDoc = await getDocument(doc.id);
    const d = freshDoc || doc;
    setSelectedDoc(d);
    setCourseName(d.courseName || "");
    setCompletionDate(d.completionDate || "");
    setInstructorName(d.instructorName || "");
    setOshaStandard(d.oshaStandard || "");
    setSelectedTraineeIds(d.traineeIds || []);
    setShowRejectInput(false);
    setRejectReason("");
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedDoc) return;
    await reviewDocument(selectedDoc.id, {
      courseName,
      completionDate,
      instructorName,
      oshaStandard,
      traineeIds: selectedTraineeIds,
    });
    await approveDocument(selectedDoc.id);
    toast({ title: t("documents.approveSuccess") });
    setReviewDialogOpen(false);
    await loadData();
  };

  const handleReject = async () => {
    if (!selectedDoc) return;
    await rejectDocument(selectedDoc.id, rejectReason);
    toast({ title: t("documents.rejectSuccess") });
    setReviewDialogOpen(false);
    await loadData();
  };

  const toggleTrainee = (empId: string) => {
    setSelectedTraineeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const statusBadgeVariant = (status: MockDocument["status"]) => {
    switch (status) {
      case "Processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Needs Review":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      case "Approved":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "Rejected":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200";
      default:
        return "";
    }
  };

  const statusIcon = (status: MockDocument["status"]) => {
    switch (status) {
      case "Processing":
        return <Clock className="w-3 h-3" />;
      case "Needs Review":
        return <Eye className="w-3 h-3" />;
      case "Approved":
        return <CheckCircle className="w-3 h-3" />;
      case "Rejected":
        return <XCircle className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="documents-page">
      <div data-testid="documents-header">
        <h1 className="text-2xl font-bold" data-testid="text-documents-title">
          {t("documents.title")}
        </h1>
        <p className="text-muted-foreground" data-testid="text-documents-subtitle">
          {t("documents.subtitle")}
        </p>
      </div>

      <Card
        className="border-dashed border-2"
        data-testid="upload-box"
      >
        <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
          <Upload className="w-10 h-10 text-muted-foreground" data-testid="icon-upload" />
          <p className="text-lg font-medium" data-testid="text-drag-drop">
            {t("documents.dragDrop")}
          </p>
          <p className="text-sm text-muted-foreground" data-testid="text-drag-drop-desc">
            {t("documents.dragDropDesc")}
          </p>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            data-testid="button-upload"
          >
            <Upload className="w-4 h-4 mr-2" />
            {t("common.upload")}
          </Button>
        </CardContent>
      </Card>

      <Card data-testid="document-list-card">
        <CardHeader>
          <CardTitle data-testid="text-document-list-title">{t("documents.list")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground" data-testid="text-loading">
              {t("common.loading")}
            </p>
          ) : documents.length === 0 ? (
            <p className="text-muted-foreground" data-testid="text-no-documents">
              {t("documents.noDocuments")}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="documents-table">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium" data-testid="th-filename">
                      {t("common.name")}
                    </th>
                    <th className="text-left py-2 px-3 font-medium" data-testid="th-upload-date">
                      {t("common.date")}
                    </th>
                    <th className="text-left py-2 px-3 font-medium" data-testid="th-status">
                      {t("documents.status")}
                    </th>
                    <th className="text-left py-2 px-3 font-medium" data-testid="th-actions">
                      {t("common.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-b last:border-b-0"
                      data-testid={`row-document-${doc.id}`}
                    >
                      <td className="py-2 px-3" data-testid={`text-filename-${doc.id}`}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          {doc.fileName}
                        </div>
                      </td>
                      <td className="py-2 px-3" data-testid={`text-upload-date-${doc.id}`}>
                        {doc.uploadDate}
                      </td>
                      <td className="py-2 px-3" data-testid={`badge-status-${doc.id}`}>
                        <Badge
                          variant="outline"
                          className={`no-default-hover-elevate no-default-active-elevate gap-1 ${statusBadgeVariant(doc.status)}`}
                        >
                          {statusIcon(doc.status)}
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-3" data-testid={`cell-actions-${doc.id}`}>
                        {doc.status === "Needs Review" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewDialog(doc)}
                            data-testid={`button-review-${doc.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {t("documents.review")}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" data-testid="review-dialog">
          <DialogHeader>
            <DialogTitle data-testid="text-review-title">{t("documents.review")}</DialogTitle>
            <DialogDescription data-testid="text-review-filename">
              {selectedDoc?.fileName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseName" data-testid="label-course-name">
                {t("documents.courseName")}
              </Label>
              <Input
                id="courseName"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                data-testid="input-course-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="completionDate" data-testid="label-completion-date">
                {t("documents.completionDate")}
              </Label>
              <Input
                id="completionDate"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                data-testid="input-completion-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructorName" data-testid="label-instructor-name">
                {t("documents.instructorName")}
              </Label>
              <Input
                id="instructorName"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                data-testid="input-instructor-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oshaStandard" data-testid="label-osha-standard">
                {t("documents.oshaStandard")}
              </Label>
              <Input
                id="oshaStandard"
                value={oshaStandard}
                onChange={(e) => setOshaStandard(e.target.value)}
                data-testid="input-osha-standard"
              />
            </div>

            <div className="space-y-2">
              <Label data-testid="label-trainee-list">{t("documents.traineeList")}</Label>
              <div
                className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto"
                data-testid="trainee-list"
              >
                {employees.map((emp) => (
                  <label
                    key={emp.id}
                    className="flex items-center gap-2 cursor-pointer"
                    data-testid={`trainee-option-${emp.id}`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTraineeIds.includes(emp.id)}
                      onChange={() => toggleTrainee(emp.id)}
                      className="rounded"
                      data-testid={`checkbox-trainee-${emp.id}`}
                    />
                    <span className="text-sm">
                      {emp.firstName} {emp.lastName} - {emp.role}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {showRejectInput && (
              <div className="space-y-2">
                <Label htmlFor="rejectReason" data-testid="label-reject-reason">
                  {t("documents.rejectReason")}
                </Label>
                <Textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  data-testid="textarea-reject-reason"
                />
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  className="w-full"
                  data-testid="button-confirm-reject"
                >
                  {t("common.submit")}
                </Button>
              </div>
            )}

            {!showRejectInput && (
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-emerald-600 text-white border-emerald-700"
                  data-testid="button-approve"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {t("documents.approveDoc")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectInput(true)}
                  className="flex-1"
                  data-testid="button-reject"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  {t("documents.rejectDoc")}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
