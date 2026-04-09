"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Check, Loader2, Upload } from "lucide-react";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { DEPARTMENTS } from "@/lib/departments";

const formSchema = z.object({
  name: z.string().min(3, "Item name must be at least 3 characters."),
  department: z.string({ required_error: "Please select a department." }),
  location: z.enum(["Library", "Canteen", "Sports Complex", "Hostel", "Labs"]),
  found: z.enum(["lost", "found"]).optional(),
  description: z.string().min(10, "Description must be at least 10 characters.").max(300),
  photo: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AddItemForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      found: 'lost',
      description: "",
    },
  });

  const userCollegeId = typeof window !== 'undefined' ? localStorage.getItem('user_collegeId') : null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const base = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://127.0.0.1:8000';
      const payload = {
        title: values.name,
        description: values.description,
        department: values.department,
        location: values.location,
        found: (values as any).found === 'found',
        // include owner collegeId from localStorage as a dev helper for assigning ownership
        owner_collegeId: typeof window !== 'undefined' ? localStorage.getItem('user_collegeId') : null,
      } as any;

      // If we have an image preview that's a data URL, include it as imageUrl
      if (imagePreview && imagePreview.startsWith('data:')) {
        payload.imageUrl = imagePreview;
      } else {
        payload.imageUrl = '';
      }

      const res = await fetch(`${base.replace(/\/$/, '')}/api/items/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'unknown' }));
        throw new Error(err.detail || 'Failed to create item');
      }

  const data = await res.json();
  console.log('Created item', data);
  toast({ title: 'Success!', description: 'Your item has been posted successfully.' });
  form.reset();
  setImagePreview(null);
  // Redirect to My Items so the list will be refetched and show the new item
  router.push('/dashboard/my-items');
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message || 'Failed to post item.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const descriptionLength = form.watch("description")?.length || 0;

  return (
    <Card>
      <CardContent className="pt-6">
        { !userCollegeId ? (
          <div className="p-3 mb-4 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
            You are not logged in. Items posted now may not appear in "My Items" until you log in. <a href="/login" className="underline">Login</a>
          </div>
        ) : null }
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Photo</FormLabel>
                      <FormControl>
                        <div className="flex flex-col items-center justify-center w-full">
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                            {imagePreview ? (
                              <Image src={imagePreview} alt="Preview" width={256} height={256} className="object-contain h-full w-full p-2" />
                            ) : (
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                              </div>
                            )}
                            <Input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Black Leather Wallet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPARTMENTS.map((group) => (
                            <SelectGroup key={group.label}>
                              <FormLabel className="px-2 py-1.5 text-xs font-semibold">{group.label}</FormLabel>
                              {group.options.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Seen Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Library">Library</SelectItem>
                          <SelectItem value="Canteen">Canteen</SelectItem>
                          <SelectItem value="Sports Complex">Sports Complex</SelectItem>
                          <SelectItem value="Hostel">Hostel</SelectItem>
                          <SelectItem value="Labs">Labs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="found"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Lost or Found" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lost">Lost</SelectItem>
                          <SelectItem value="found">Found</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                 <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide details like color, brand, or any unique features."
                          className="resize-none"
                          {...field}
                          maxLength={300}
                        />
                      </FormControl>
                       <div className="text-xs text-right text-muted-foreground">
                        {descriptionLength}/300
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </motion.div>
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Add Item
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}