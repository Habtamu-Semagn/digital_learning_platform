"use client";

import { useState, useEffect } from "react";
import { StudentAPI } from "@/lib/api";
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
  BookOpen,
  Download,
  Clock,
  Eye,
  FileText,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const categories = [
  "All",
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "History",
  "Literature",
  "Biology",
  "General",
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "title", label: "Title A-Z" },
];

export default function LibraryPage() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      applyFilters();
    }
  }, [searchQuery, selectedCategory, sortBy, allBooks]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await StudentAPI.getAllBooks(1, 100);
      setAllBooks(data.books || []);
      setBooks(data.books || []);
    } catch (error) {
      console.error("Failed to fetch books:", error);
      toast.error("Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      applyFilters();
      return;
    }

    try {
      setSearching(true);
      const results = await StudentAPI.searchBooks(searchQuery);
      let filteredResults = results;

      // Apply category filter
      if (selectedCategory !== "All") {
        filteredResults = filteredResults.filter(
          (book: any) => book.category === selectedCategory
        );
      }

      // Apply sorting
      filteredResults = applySorting(filteredResults);
      setBooks(filteredResults);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const applyFilters = () => {
    let filteredBooks = [...allBooks];

    // Category filter
    if (selectedCategory !== "All") {
      filteredBooks = filteredBooks.filter(
        (book) => book.category === selectedCategory
      );
    }

    // Sort books
    filteredBooks = applySorting(filteredBooks);
    setBooks(filteredBooks);
  };

  const applySorting = (booksToSort: any[]) => {
    return [...booksToSort].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "popular":
          return (b.views || 0) - (a.views || 0);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("newest");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "All";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Library</h1>
        <p className="text-muted-foreground">
          Explore our collection of educational books and materials
        </p>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {books.length} {books.length === 1 ? "Book" : "Books"}
          </h2>
        </div>

        {/* Books Grid */}
        {loading || searching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book._id} book={book} router={router} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {hasActiveFilters
                  ? "We couldn't find any books matching your filters."
                  : "No books are currently available in the library."}
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

// Book Card Component
function BookCard({ book, router }: any) {
  const getFileIcon = (mimeType: string) => {
    if (mimeType?.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    return <BookOpen className="h-4 w-4 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const getFileType = (mimeType: string) => {
    if (mimeType?.includes('pdf')) return 'PDF';
    if (mimeType?.includes('epub')) return 'ePub';
    return 'Document';
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader className="p-4 pb-2 flex-1">
        {/* Book Thumbnail */}
        <div className="aspect-[3/4] bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center relative overflow-hidden mb-3">
          <BookOpen className="h-12 w-12 text-muted-foreground" />

          {/* File Type Badge */}
          <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground">
            <div className="flex items-center gap-1">
              {getFileIcon(book.mimeType)}
              <span className="text-xs">{getFileType(book.mimeType)}</span>
            </div>
          </Badge>
        </div>

        {/* Book Info */}
        <div className="space-y-2">
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2 leading-tight">
            {book.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm">
            {book.description || 'No description available'}
          </CardDescription>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-muted-foreground">
              {book.uploadedBy?.name || book.author || 'Unknown'}
            </span>
            <Badge variant="secondary" className="capitalize text-xs">
              {book.category || 'General'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{book.views || 0} views</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{book.downloads || 0} downloads</span>
          </div>
        </div>

        {/* File Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(book.fileSize)}</span>
          <span>{new Date(book.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Tags */}
        {book.tags && book.tags.length > 0 && (
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
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => router.push(`/dashboard/student/library/${book._id}`)}>
          <BookOpen className="h-4 w-4 mr-1" />
          View
        </Button>
        {book.fileUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/${book.fileUrl}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
