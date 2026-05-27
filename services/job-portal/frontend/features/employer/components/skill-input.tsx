import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useState } from "react";

const PREDEFINED_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express",
  "Python", "Django", "Flask", "Java", "Spring Boot", "C++", "C#", ".NET",
  "Ruby", "Ruby on Rails", "PHP", "Laravel", "Go", "Rust", "Swift", "Kotlin",
  "React Native", "Flutter", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Git", "CI/CD",
  "GraphQL", "REST API", "Tailwind CSS", "SASS", "HTML", "CSS",
  "Machine Learning", "Data Science", "UI/UX Design", "Figma",
];

export function SkillInput({
  currentSkills,
  onChange,
  error,
}: {
  currentSkills: string[];
  onChange: (skills: string[]) => void;
  error?: string;
}) {
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSkills = PREDEFINED_SKILLS.filter(
    (s) =>
      s.toLowerCase().includes(skillInput.toLowerCase()) &&
      !currentSkills.includes(s),
  );

  const addSkill = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !currentSkills.includes(trimmed)) {
      onChange([...currentSkills, trimmed]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) =>
    onChange(currentSkills.filter((s) => s !== skill));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && currentSkills.length > 0) {
      onChange(currentSkills.slice(0, -1));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      const toAdd = val.split(",").map((s) => s.trim()).filter(Boolean);
      const merged = [...currentSkills];
      toAdd.forEach((s) => { if (!merged.includes(s)) merged.push(s); });
      onChange(merged);
      setSkillInput("");
      setShowSuggestions(false);
    } else {
      setSkillInput(val);
      setShowSuggestions(true);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Skills</Label>
      <div className="relative">
        <div className="focus-within:ring-ring bg-background flex flex-wrap gap-2 rounded-md border p-2 focus-within:ring-2">
          {currentSkills.map((skill) => (
            <Badge key={skill} variant="secondary" className="bg-secondary/50 rounded-sm border-none px-2 py-1">
              {skill}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onClick={() => removeSkill(skill)}
                className="ml-1"
              >
                <X className="text-muted-foreground hover:text-destructive h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            value={skillInput}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => { if (skillInput.trim()) addSkill(skillInput); setShowSuggestions(false); }}
            placeholder="Add skill... (comma or enter to add)"
            className="min-w-[150px] flex-1 bg-transparent outline-none"
          />
        </div>
        {showSuggestions && skillInput && filteredSkills.length > 0 && (
          <div className="bg-popover text-popover-foreground absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border shadow-md">
            {filteredSkills.map((skill) => (
              <div
                key={skill}
                className="hover:bg-muted cursor-pointer px-4 py-2 text-sm"
                onMouseDown={(e) => { e.preventDefault(); addSkill(skill); setShowSuggestions(false); }}
              >
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}