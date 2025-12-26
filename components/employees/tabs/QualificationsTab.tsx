'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Briefcase, Plus, Trash2, CalendarIcon, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { Employee, Education, WorkExperience, Qualification, FieldPermission } from '@/lib/types';
import { cn } from '@/lib/utils';

interface QualificationsTabProps {
  data: Employee;
  onChange: (field: string, value: unknown) => void;
  isEditing: boolean;
  permissions: {
    allFields: FieldPermission;
  };
}

const qualifications: Qualification[] = [
  'PhD',
  'Masters',
  'Bachelors',
  'Diploma',
  'A-Level',
  'O-Level',
  'N-Level',
  'PSLE',
  'Others',
];

export function QualificationsTab({ data, onChange, isEditing, permissions }: QualificationsTabProps) {
  const canEdit = permissions.allFields.write && isEditing;
  const canView = permissions.allFields.read;

  const addEducation = () => {
    const newEducation: Education = {
      id: `edu-${Date.now()}`,
      institution: '',
      qualification: 'Bachelors',
      fieldOfStudy: '',
      yearObtained: new Date().getFullYear(),
    };
    onChange('educationHistory', [...(data.educationHistory || []), newEducation]);
  };

  const removeEducation = (id: string) => {
    onChange(
      'educationHistory',
      data.educationHistory.filter((edu) => edu.id !== id)
    );
  };

  const updateEducation = (id: string, field: keyof Education, value: unknown) => {
    onChange(
      'educationHistory',
      data.educationHistory.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    );
  };

  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: `exp-${Date.now()}`,
      companyName: '',
      jobTitle: '',
      startDate: '',
      endDate: '',
      description: '',
      isCurrent: false,
    };
    onChange('workExperience', [...(data.workExperience || []), newExperience]);
  };

  const removeExperience = (id: string) => {
    onChange(
      'workExperience',
      data.workExperience.filter((exp) => exp.id !== id)
    );
  };

  const updateExperience = (id: string, field: keyof WorkExperience, value: unknown) => {
    onChange(
      'workExperience',
      data.workExperience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Highest Qualification */}
      <Card className="border-t-4 border-t-[#2196F3]">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#2196F3]/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-[#2196F3]" />
            </div>
            <div>
              <CardTitle>Qualifications & Experience</CardTitle>
              <CardDescription>
                Education background and work history
              </CardDescription>
              {data.updatedAt && (
                <p className="text-xs text-gray-400 mt-1">
                  Last modified: {new Date(data.updatedAt).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Highest Qualification Attained</Label>
              {!canEdit && canView && <Lock className="h-3 w-3 text-gray-400" />}
            </div>
            {canEdit ? (
              <Select
                value={data.highestQualification}
                onValueChange={(v) => onChange('highestQualification', v)}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select qualification" />
                </SelectTrigger>
                <SelectContent>
                  {qualifications.map((qual) => (
                    <SelectItem key={qual} value={qual}>
                      {qual}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 flex items-center px-3 bg-gray-50 dark:bg-gray-800 rounded-md border w-full md:w-64">
                {canView ? data.highestQualification || '-' : '••••••••'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Education History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-gray-500" />
              <CardTitle className="text-lg">Education History</CardTitle>
              <Badge variant="secondary">{data.educationHistory?.length || 0}</Badge>
            </div>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={addEducation}>
                <Plus className="h-4 w-4 mr-1" />
                Add Education
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!data.educationHistory || data.educationHistory.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No education records added yet.</p>
              {canEdit && (
                <Button variant="link" onClick={addEducation} className="mt-2">
                  Add your first education record
                </Button>
              )}
            </div>
          ) : (
            data.educationHistory.map((edu, index) => (
              <div
                key={edu.id}
                className="p-4 border rounded-lg space-y-4 bg-gray-50/50 dark:bg-gray-800/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-500">
                    Education #{index + 1}
                  </span>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    {canEdit ? (
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="University/School name"
                      />
                    ) : (
                      <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                        {canView ? edu.institution || '-' : '••••••••'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Qualification</Label>
                    {canEdit ? (
                      <Select
                        value={edu.qualification}
                        onValueChange={(v) => updateEducation(edu.id, 'qualification', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {qualifications.map((qual) => (
                            <SelectItem key={qual} value={qual}>
                              {qual}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                        {canView ? edu.qualification || '-' : '••••••••'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Field of Study</Label>
                    {canEdit ? (
                      <Input
                        value={edu.fieldOfStudy}
                        onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                        placeholder="e.g. Computer Science"
                      />
                    ) : (
                      <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                        {canView ? edu.fieldOfStudy || '-' : '••••••••'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Year Obtained</Label>
                    {canEdit ? (
                      <Input
                        type="number"
                        value={edu.yearObtained}
                        onChange={(e) => updateEducation(edu.id, 'yearObtained', parseInt(e.target.value))}
                        min={1950}
                        max={new Date().getFullYear()}
                      />
                    ) : (
                      <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                        {canView ? edu.yearObtained || '-' : '••••••••'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-500" />
              <CardTitle className="text-lg">Work Experience</CardTitle>
              <Badge variant="secondary">{data.workExperience?.length || 0}</Badge>
            </div>
            {canEdit && (
              <Button variant="outline" size="sm" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-1" />
                Add Experience
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!data.workExperience || data.workExperience.length === 0) ? (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No work experience added yet.</p>
              {canEdit && (
                <Button variant="link" onClick={addExperience} className="mt-2">
                  Add your first work experience
                </Button>
              )}
            </div>
          ) : (
            data.workExperience.map((exp, index) => (
              <div
                key={exp.id}
                className="p-4 border rounded-lg space-y-4 bg-gray-50/50 dark:bg-gray-800/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-500">
                      Experience #{index + 1}
                    </span>
                    {exp.isCurrent && (
                      <Badge variant="default" className="bg-[#00A651]">
                        Current
                      </Badge>
                    )}
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                      onClick={() => removeExperience(exp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    {canEdit ? (
                      <Input
                        value={exp.companyName}
                        onChange={(e) => updateExperience(exp.id, 'companyName', e.target.value)}
                        placeholder="Company name"
                      />
                    ) : (
                      <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                        {canView ? exp.companyName || '-' : '••••••••'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    {canEdit ? (
                      <Input
                        value={exp.jobTitle}
                        onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                        placeholder="Your role"
                      />
                    ) : (
                      <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                        {canView ? exp.jobTitle || '-' : '••••••••'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    {canEdit ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !exp.startDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {exp.startDate ? format(new Date(exp.startDate), 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={exp.startDate ? new Date(exp.startDate) : undefined}
                            onSelect={(date) =>
                              updateExperience(exp.id, 'startDate', date?.toISOString().split('T')[0])
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                        {canView && exp.startDate ? format(new Date(exp.startDate), 'PPP') : '-'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    {canEdit ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !exp.endDate && 'text-muted-foreground'
                            )}
                            disabled={exp.isCurrent}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {exp.isCurrent
                              ? 'Present'
                              : exp.endDate
                              ? format(new Date(exp.endDate), 'PPP')
                              : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={exp.endDate ? new Date(exp.endDate) : undefined}
                            onSelect={(date) =>
                              updateExperience(exp.id, 'endDate', date?.toISOString().split('T')[0])
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <div className="h-10 flex items-center px-3 bg-white dark:bg-gray-800 rounded-md border">
                        {exp.isCurrent ? 'Present' : canView && exp.endDate ? format(new Date(exp.endDate), 'PPP') : '-'}
                      </div>
                    )}
                  </div>

                  {canEdit && (
                    <div className="flex items-center space-x-2 md:col-span-2">
                      <Checkbox
                        id={`current-${exp.id}`}
                        checked={exp.isCurrent}
                        onCheckedChange={(checked) => {
                          updateExperience(exp.id, 'isCurrent', checked);
                          if (checked) {
                            updateExperience(exp.id, 'endDate', '');
                          }
                        }}
                      />
                      <Label htmlFor={`current-${exp.id}`} className="text-sm">
                        I currently work here
                      </Label>
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    {canEdit ? (
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Brief description of your role and responsibilities"
                        rows={3}
                      />
                    ) : (
                      <div className="min-h-[80px] flex items-start p-3 bg-white dark:bg-gray-800 rounded-md border">
                        {canView ? exp.description || '-' : '••••••••'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

