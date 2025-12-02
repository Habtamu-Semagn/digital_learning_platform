"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  BookOpen,
  Download,
  Bookmark,
  Clock,
  Eye,
  FileText,
  X,
  SlidersHorizontal,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Mock data - replace with actual API calls
const libraryBooks = [
  {
    _id: "book_1",
    title: "Advanced Calculus",
    description:
      "Comprehensive guide to advanced calculus concepts including multivariable calculus and vector analysis.",
    fileUrl: "/books/calculus.pdf",
    fileSize: 2540000,
    fileType: "pdf",
    category: "Mathematics",
    tags: ["calculus", "mathematics", "advanced"],
    thumbnail: "/thumbnails/calculus.jpg",
    uploadedBy: "Dr. Sarah Smith",
    viewCount: 156,
    downloadCount: 89,
    averageRating: 4.7,
    duration: "3h 15m",
    createdAt: "2024-01-10T08:00:00Z",
  },
  {
    _id: "book_2",
    title: "Introduction to Python Programming",
    description:
      "Learn Python from scratch with practical examples and projects.",
    fileUrl: "/books/python.epub",
    fileSize: 1850000,
    fileType: "epub",
    category: "Computer Science",
    tags: ["python", "programming", "beginner"],
    thumbnail: "/thumbnails/python.jpg",
    uploadedBy: "Prof. John Davis",
    viewCount: 234,
    downloadCount: 167,
    averageRating: 4.8,
    duration: "4h 30m",
    createdAt: "2024-01-12T14:30:00Z",
  },
  {
    _id: "book_3",
    title: "Modern Physics Textbook",
    description:
      "Comprehensive coverage of modern physics including quantum mechanics and relativity.",
    fileUrl: "/books/physics.pdf",
    fileSize: 3200000,
    fileType: "pdf",
    category: "Physics",
    tags: ["physics", "quantum", "relativity"],
    thumbnail: "/thumbnails/physics.jpg",
    uploadedBy: "Dr. Emily Chen",
    viewCount: 98,
    downloadCount: 45,
    averageRating: 4.6,
    duration: "5h 20m",
    createdAt: "2024-01-08T11:20:00Z",
  },
  {
    _id: "book_4",
    title: "Organic Chemistry Fundamentals",
    description:
      "Essential organic chemistry concepts with detailed explanations and examples.",
    fileUrl: "/books/chemistry.pdf",
    fileSize: 2870000,
    fileType: "pdf",
    category: "Chemistry",
    tags: ["chemistry", "organic", "science"],
    thumbnail: "/thumbnails/chemistry.jpg",
    uploadedBy: "Prof. Mike Johnson",
    viewCount: 167,
    downloadCount: 92,
    averageRating: 4.5,
    duration: "3h 45m",
    createdAt: "2024-01-15T09:45:00Z",
  },
  {
    _id: "book_5",
    title: "Data Structures and Algorithms",
    description:
      "Master data structures and algorithms with practical implementations.",
    fileUrl: "/books/algorithms.epub",
    fileSize: 2150000,
    fileType: "epub",
    category: "Computer Science",
    tags: ["algorithms", "data structures", "programming"],
    thumbnail: "/thumbnails/algorithms.jpg",
    uploadedBy: "Dr. Lisa Wang",
    viewCount: 189,
    downloadCount: 134,
    averageRating: 4.9,
    duration: "6h 15m",
    createdAt: "2024-01-05T16:20:00Z",
  },
  {
    _id: "book_6",
    title: "World History: Ancient Civilizations",
    description:
      "Explore ancient civilizations and their impact on modern society.",
    fileUrl: "/books/history.pdf",
    fileSize: 1980000,
    fileType: "pdf",
    category: "History",
    tags: ["history", "ancient", "civilizations"],
    thumbnail: "/thumbnails/history.jpg",
    uploadedBy: "Prof. Robert Brown",
    viewCount: 76,
    downloadCount: 38,
    averageRating: 4.4,
    duration: "4h 10m",
    createdAt: "2024-01-18T13:15:00Z",
  },
];

const categories = [
  "All",
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "History",
  "Literature",
  "Biology",
];
const fileTypes = ["All", "pdf", "epub", "doc"];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "title", label: "Title A-Z" },
  { value: "rating", label: "Highest Rated" },
];

export default function LibraryPage() {
  const [books, setBooks] = useState(libraryBooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFileType, setSelectedFileType] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter and search books
  useEffect(() => {
    let filteredBooks = libraryBooks;

    // Search filter
    if (searchQuery) {
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          book.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      filteredBooks = filteredBooks.filter(
        (book) => book.category === selectedCategory
      );
    }

    // File type filter
    if (selectedFileType !== "All") {
      filteredBooks = filteredBooks.filter(
        (book) => book.fileType === selectedFileType
      );
    }

    // Sort books
    filteredBooks = [...filteredBooks].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "popular":
          return b.viewCount - a.viewCount;
        case "title":
          return a.title.localeCompare(b.title);
        case "rating":
          return b.averageRating - a.averageRating;
        default:
          return 0;
      }
    });

    setBooks(filteredBooks);
  }, [searchQuery, selectedCategory, selectedFileType, sortBy]);

  const handleDownload = async (bookId: string) => {
    try {
      await fetch(`/api/books/${bookId}/download`, {
        method: "POST",
      });
      alert("Download started!");
    } catch (error) {
      alert("Failed to download book");
    }
  };

  const handleBookmark = async (bookId: string) => {
    try {
      await fetch(`/api/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId: bookId, contentType: "book" }),
      });
      alert("Book added to bookmarks!");
    } catch (error) {
      alert("Failed to bookmark book");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedFileType("All");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== "All" || selectedFileType !== "All";

  const activeFiltersCount = [
    searchQuery ? 1 : 0,
    selectedCategory !== "All" ? 1 : 0,
    selectedFileType !== "All" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-muted-foreground">
          Explore our collection of educational books and materials
        </p>
      </div>

      {/* Main Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search and Main Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books, topics, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Category Filter */}
                <div className="w-full sm:w-48">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* File Type Filter */}
                <div className="w-full sm:w-32">
                  <Select
                    value={selectedFileType}
                    onValueChange={setSelectedFileType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      {fileTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="w-full sm:w-40">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Advanced Filters Toggle and Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced Filters
                  {activeFiltersCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Active filters:</span>
                    {searchQuery && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        Search: "{searchQuery}"
                        <button onClick={() => setSearchQuery("")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedCategory !== "All" && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        Category: {selectedCategory}
                        <button onClick={() => setSelectedCategory("All")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedFileType !== "All" && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        Type: {selectedFileType}
                        <button onClick={() => setSelectedFileType("All")}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Advanced Filters Panel */}
            {showAdvancedFilters && (
              <div className="pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Rating Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm">Minimum Rating</Label>
                    <Select defaultValue="0">
                      <SelectTrigger>
                        <SelectValue placeholder="Any rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Any rating</SelectItem>
                        <SelectItem value="4">⭐ 4.0+</SelectItem>
                        <SelectItem value="4.5">⭐ 4.5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* File Size Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm">File Size</Label>
                    <Select defaultValue="any">
                      <SelectTrigger>
                        <SelectValue placeholder="Any size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any size</SelectItem>
                        <SelectItem value="small">Small (&lt; 2MB)</SelectItem>
                        <SelectItem value="medium">Medium (2-5MB)</SelectItem>
                        <SelectItem value="large">Large (&gt; 5MB)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Upload Date Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm">Upload Date</Label>
                    <Select defaultValue="any">
                      <SelectTrigger>
                        <SelectValue placeholder="Any time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any time</SelectItem>
                        <SelectItem value="week">Past week</SelectItem>
                        <SelectItem value="month">Past month</SelectItem>
                        <SelectItem value="year">Past year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{books.length}</span>
                    <span>books found</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {
                        libraryBooks.filter((book) => book.fileType === "pdf")
                          .length
                      }
                    </span>
                    <span>PDF files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {
                        libraryBooks.filter((book) => book.fileType === "epub")
                          .length
                      }
                    </span>
                    <span>ePub files</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results and Books Grid */}
      <div className="space-y-4">
        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {books.length} {books.length === 1 ? "Book" : "Books"}
            </h2>
            {hasActiveFilters && (
              <p className="text-sm text-muted-foreground">
                Filtered results
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== "All" && ` in ${selectedCategory}`}
                {selectedFileType !== "All" &&
                  ` (${selectedFileType.toUpperCase()})`}
              </p>
            )}
          </div>

          {/* View Toggle (Future Enhancement) */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Grid View
            </Button>
            <Button variant="outline" size="sm" disabled>
              List View
            </Button>
          </div>
        </div>

        {/* Books Grid */}
        {books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard
                key={book._id}
                book={book}
                onDownload={handleDownload}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {hasActiveFilters
                  ? "We couldn't find any books matching your current filters. Try adjusting your search criteria."
                  : "No books are currently available in the library. Please check back later."}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} size="lg">
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Book Card Component (Same as before)
function BookCard({ book, onDownload, onBookmark }: any) {
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />;
      case "epub":
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader className="p-4 pb-2 flex-1">
        {/* Book Thumbnail */}
        <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center relative overflow-hidden mb-3">
          {book.thumbnail ? (
            <img
              src={book.thumbnail}
              alt={book.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          )}

          {/* File Type Badge */}
          <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground">
            <div className="flex items-center gap-1">
              {getFileIcon(book.fileType)}
              <span className="text-xs">{book.fileType.toUpperCase()}</span>
            </div>
          </Badge>

          {/* Rating Badge */}
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-white flex items-center gap-1">
            <span className="text-xs">⭐ {book.averageRating}</span>
          </Badge>
        </div>

        {/* Book Info */}
        <div className="space-y-2">
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {book.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm">
            {book.description}
          </CardDescription>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              {book.uploadedBy}
            </span>
            <Badge variant="secondary" className="capitalize text-xs">
              {book.category}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3 flex-1">
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{book.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{book.viewCount} views</span>
          </div>
        </div>

        {/* File Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(book.fileSize)}</span>
          <span>{book.downloadCount} downloads</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {book.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {book.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{book.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button size="sm" className="flex-1" asChild>
          <a href={`/student/library/${book._id}`}>
            <BookOpen className="h-4 w-4 mr-1" />
            Read
          </a>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDownload(book._id)}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onBookmark(book._id)}
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
