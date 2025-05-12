import { Clock, Code2, Calendar, Users } from "lucide-react";

export const INTERVIEW_CATEGORY = [
  { id: "upcoming", title: "Upcoming Interviews", variant: "outline" },
  { id: "completed", title: "Completed", variant: "secondary" },
  { id: "succeeded", title: "Succeeded", variant: "default" },
  { id: "failed", title: "Failed", variant: "destructive" },
] as const;

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

export const QUICK_ACTIONS = [
  {
    icon: Code2,
    title: "New Call",
    description: "Start an instant call",
    color: "primary",
    gradient: "from-primary/10 via-primary/5 to-transparent",
  },
  {
    icon: Users,
    title: "Join Interview",
    description: "Enter via invitation link",
    color: "purple-500",
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
  },
  {
    icon: Calendar,
    title: "Schedule",
    description: "Plan upcoming interviews",
    color: "blue-500",
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
  },
  {
    icon: Clock,
    title: "Recordings",
    description: "Access past interviews",
    color: "orange-500",
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
  },
];

export const CODING_QUESTIONS: CodeQuestion[] = [
  {
    id: "find-duplicate",
    title: "Find the Duplicate Number",
    description:
      "Given an array of integers `nums` containing `n + 1` integers where each integer is in the range `[1, n]` inclusive, return the duplicate number.\n\nYou must solve the problem without modifying the array and use only constant extra space.",
    examples: [
      {
        input: "nums = [1,3,4,2,2]",
        output: "2",
      },
      {
        input: "nums = [3,1,3,4,2]",
        output: "3",
      },
    ],
    starterCode: {
      javascript: `function findDuplicate(nums) {
  // Write your solution here
  
}`,
      python: `def find_duplicate(nums):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int findDuplicate(int[] nums) {
        // Write your solution here
        
    }
}`,
    },
    constraints: [
      "1 ≤ nums.length ≤ 10⁵",
      "There is only one repeated number but it could be repeated more than once.",
    ],
  },
  {
    id: "house-robber",
    title: "House Robber",
    description:
      "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money. The only constraint is that adjacent houses cannot be robbed.\n\nReturn the maximum amount of money you can rob without alerting the police.",
    examples: [
      {
        input: "nums = [1,2,3,1]",
        output: "4",
        explanation: "Rob house 1 (1) and house 3 (3) = 4",
      },
      {
        input: "nums = [2,7,9,3,1]",
        output: "12",
      },
    ],
    starterCode: {
      javascript: `function rob(nums) {
  // Write your solution here
  
}`,
      python: `def rob(nums):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int rob(int[] nums) {
        // Write your solution here
        
    }
}`,
    },
    constraints: ["1 ≤ nums.length ≤ 100", "0 ≤ nums[i] ≤ 400"],
  },
  {
    id: "max-depth-binary-tree",
    title: "Maximum Depth of Binary Tree",
    description:
      "Given the `root` of a binary tree, return its maximum depth.\n\nThe maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
    examples: [
      {
        input: "root = [3,9,20,null,null,15,7]",
        output: "3",
      },
      {
        input: "root = [1,null,2]",
        output: "2",
      },
    ],
    starterCode: {
      javascript: `function maxDepth(root) {
  // Write your solution here
  
}`,
      python: `def max_depth(root):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int maxDepth(TreeNode root) {
        // Write your solution here
        
    }
}`,
    },
    constraints: [
      "The number of nodes in the tree is in the range [0, 10⁴].",
      "-100 ≤ Node.val ≤ 100",
    ],
  },
];

export const LANGUAGES = [
  { id: "javascript", name: "JavaScript", icon: "/javascript.png" },
  { id: "python", name: "Python", icon: "/python.png" },
  { id: "java", name: "Java", icon: "/java.png" },
] as const;

export interface CodeQuestion {
  id: string;
  title: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  constraints?: string[];
}

export type QuickActionType = (typeof QUICK_ACTIONS)[number];
