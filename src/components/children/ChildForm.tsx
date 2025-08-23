import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChildFormValues } from "@/services/students";

const gradeOptions = [
  "Pré-escola",
  "1º ano",
  "2º ano", 
  "3º ano",
  "4º ano",
  "5º ano",
  "6º ano",
  "7º ano",
  "8º ano",
  "9º ano",
  "Ensino médio"
];

const childFormSchema = z.object({
  first_name: z.string().min(1, "Nome é obrigatório"),
  last_name: z.string().optional(),
  grade: z.string().optional(),
  birthdate: z.string().optional().refine((date) => {
    if (!date) return true;
    const birthDate = new Date(date);
    const today = new Date();
    return birthDate <= today;
  }, "Data de nascimento deve ser anterior à data atual"),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

type ChildFormProps = {
  onSubmit: (values: ChildFormValues) => Promise<void>;
  submitting?: boolean;
};

export function ChildForm({ onSubmit, submitting = false }: ChildFormProps) {
  const { t } = useTranslation();
  
  const form = useForm<ChildFormValues>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      grade: "",
      birthdate: "",
      avatar_url: "",
    },
  });

  const handleSubmit = async (values: ChildFormValues) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("children.first_name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("children.first_name")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("children.last_name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("children.last_name")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("children.grade")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("children.grade")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {gradeOptions.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthdate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("children.birthdate")}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("children.avatar_url")}</FormLabel>
              <FormControl>
                <Input placeholder={t("children.avatar_url")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={submitting} className="flex-1">
            {submitting ? t("loading") : t("children.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}