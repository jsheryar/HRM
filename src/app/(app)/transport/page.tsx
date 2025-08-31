
"use client"
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2, Pencil, Search, Car } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Vehicle } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TransportPage() {
  const { vehicles, setVehicles, employees, user } = useAuth();
  const [vehicleList, setVehicleList] = React.useState<Vehicle[]>(vehicles);
  const [filteredVehicles, setFilteredVehicles] = React.useState<Vehicle[]>(vehicleList);
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [selectedVehicle, setSelectedVehicle] = React.useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = React.useState<string | null>(null);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = React.useState("");

  const getEmployeeName = (employeeId?: string) => {
    if (!employeeId) return "N/A";
    return employees.find(e => e.id === employeeId)?.fullName || "Unknown";
  };

  const openFormDialog = (vehicle: Vehicle | null = null) => {
    setSelectedVehicle(vehicle);
    setIsFormDialogOpen(true);
  };
  
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const registrationNumber = formData.get("registrationNumber") as string;
    const make = formData.get("make") as string;
    const model = formData.get("model") as string;
    const year = Number(formData.get("year"));
    const type = formData.get("type") as Vehicle['type'];
    const fuelType = formData.get("fuelType") as Vehicle['fuelType'];
    const status = formData.get("status") as Vehicle['status'];
    const allottedToValue = formData.get("allottedTo") as string | undefined;
    const allotmentDate = formData.get("allotmentDate") as string | null;

    if (!registrationNumber || !make || !model || !year || !type || !status || !fuelType) {
        toast({
            title: "Error",
            description: "Please fill out all required fields.",
            variant: "destructive",
        });
        return;
    }
    
    const allottedTo = allottedToValue === "unassigned" ? undefined : allottedToValue;

    const vehicleData: Omit<Vehicle, 'id'> & { id: string } = {
      id: selectedVehicle ? selectedVehicle.id : registrationNumber,
      registrationNumber,
      make,
      model,
      year,
      type,
      fuelType,
      status,
      allottedTo: status === 'Allotted' ? allottedTo : undefined,
      allotmentDate: status === 'Allotted' ? allotmentDate : null,
    };
    

    let updatedVehicles;
    if (selectedVehicle) {
      updatedVehicles = vehicleList.map(v => v.id === selectedVehicle.id ? { ...v, ...vehicleData } : v);
       toast({
        title: "Success",
        description: "Vehicle details updated successfully.",
      });
    } else {
      updatedVehicles = [...vehicleList, vehicleData ];
      toast({
        title: "Success",
        description: "New vehicle added successfully.",
      });
    }

    setVehicles(updatedVehicles);
    setVehicleList(updatedVehicles);
    setIsFormDialogOpen(false);
    setSelectedVehicle(null);
  };

  const handleDeleteClick = (vehicleId: string) => {
    setVehicleToDelete(vehicleId);
    setIsDeleteAlertOpen(true);
  }

  const handleDeleteConfirm = () => {
    if (vehicleToDelete) {
      const updatedVehicles = vehicleList.filter(v => v.id !== vehicleToDelete);
      setVehicles(updatedVehicles);
      setVehicleList(updatedVehicles);
      toast({
        title: "Success",
        description: `Vehicle record deleted.`,
      });
    }
    setIsDeleteAlertOpen(false);
    setVehicleToDelete(null);
  }
  
  React.useEffect(() => {
    setVehicleList(vehicles);
  }, [vehicles]);
  
  React.useEffect(() => {
    let filtered = vehicleList;
    
    // Filter by search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((vehicle) => {
        return (
          vehicle.registrationNumber.toLowerCase().includes(lowercasedQuery) ||
          vehicle.make.toLowerCase().includes(lowercasedQuery) ||
          vehicle.model.toLowerCase().includes(lowercasedQuery) ||
          getEmployeeName(vehicle.allottedTo).toLowerCase().includes(lowercasedQuery)
        );
      });
    }

    setFilteredVehicles(filtered);
  }, [searchQuery, vehicleList]);

  const userRole = user?.role?.toLowerCase();
  const canEdit = userRole === 'admin' || userRole === 'editor' || userRole === 'sub admin';
  const canDelete = userRole === 'admin' || userRole === 'sub admin';
  const canAdd = userRole === 'admin' || userRole === 'editor' || userRole === 'data entry operator' || userRole === 'sub admin';

  if (!canEdit && !canDelete && !canAdd) {
     return <div className="p-4"><p>You do not have permission to view this page.</p></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">Transport Section</h1>
          <p className="text-muted-foreground">Manage and track government vehicles.</p>
        </div>
         <div className="flex items-center gap-2">
          <Dialog open={isFormDialogOpen} onOpenChange={(isOpen) => { setIsFormDialogOpen(isOpen); if (!isOpen) setSelectedVehicle(null); }}>
            <DialogTrigger asChild>
              {canAdd && <Button onClick={() => openFormDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                <DialogDescription>
                  {selectedVehicle ? 'Update the details below.' : 'Fill in the details below to add a new vehicle.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid gap-4 py-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Registration Number</Label>
                      <Input id="registrationNumber" name="registrationNumber" defaultValue={selectedVehicle?.registrationNumber} required disabled={!!selectedVehicle}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Input id="make" name="make" defaultValue={selectedVehicle?.make} placeholder="e.g., Toyota" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input id="model" name="model" defaultValue={selectedVehicle?.model} placeholder="e.g., Corolla" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Model Year</Label>
                      <Input id="year" name="year" type="number" defaultValue={selectedVehicle?.year} placeholder="e.g., 2022" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Vehicle Type</Label>
                        <Select name="type" defaultValue={selectedVehicle?.type} required>
                            <SelectTrigger> <SelectValue placeholder="Select a type" /> </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Car">Car</SelectItem>
                                <SelectItem value="Jeep">Jeep</SelectItem>
                                <SelectItem value="Motorcycle">Motorcycle</SelectItem>
                                <SelectItem value="Van">Van</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fuelType">Fuel Type</Label>
                        <Select name="fuelType" defaultValue={selectedVehicle?.fuelType} required>
                            <SelectTrigger> <SelectValue placeholder="Select fuel type" /> </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Petrol">Petrol</SelectItem>
                                <SelectItem value="Diesel">Diesel</SelectItem>
                                <SelectItem value="Electric">Electric</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" defaultValue={selectedVehicle?.status} required>
                            <SelectTrigger> <SelectValue placeholder="Select status" /> </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="Available">Available</SelectItem>
                               <SelectItem value="Allotted">Allotted</SelectItem>
                               <SelectItem value="In Workshop">In Workshop</SelectItem>
                               <SelectItem value="Disposed">Disposed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="allottedTo">Allotted To</Label>
                        <Select name="allottedTo" defaultValue={selectedVehicle?.allottedTo || 'unassigned'}>
                            <SelectTrigger> <SelectValue placeholder="Select an employee" /> </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned">None</SelectItem>
                                {employees.filter(e => e.status === 'Active').map(e => <SelectItem key={e.id} value={e.id}>{e.fullName} ({e.designation})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="allotmentDate">Allotment Date</Label>
                      <Input id="allotmentDate" name="allotmentDate" type="date" defaultValue={selectedVehicle?.allotmentDate || ''} />
                    </div>
                </div>
                <DialogFooter className="pt-6">
                  <Button type="submit">{selectedVehicle ? 'Save Changes' : 'Add Vehicle'}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
       <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Registration No, Make, Model, or Allottee..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="rounded-lg border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Reg. No.</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Allotted To</TableHead>
                    <TableHead>Allotment Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredVehicles.length > 0 ? (
                    filteredVehicles.map(v => (
                        <TableRow key={v.id}>
                            <TableCell className="font-medium">{v.registrationNumber}</TableCell>
                            <TableCell>
                                <div className="font-medium">{v.make} {v.model}</div>
                                <div className="text-sm text-muted-foreground">Year: {v.year}, {v.fuelType}</div>
                            </TableCell>
                            <TableCell>{v.type}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    v.status === 'Available' ? 'default' :
                                    v.status === 'Allotted' ? 'secondary' : 'destructive'
                                } className={cn(
                                    {'bg-green-500 text-white': v.status === 'Available'},
                                    {'bg-blue-500 text-white': v.status === 'Allotted'},
                                    {'bg-yellow-500 text-white': v.status === 'In Workshop'},
                                    {'bg-gray-500 text-white': v.status === 'Disposed'},
                                )}>
                                    {v.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{getEmployeeName(v.allottedTo)}</TableCell>
                            <TableCell>{v.allotmentDate || "N/A"}</TableCell>
                            <TableCell className="text-right">
                                {canEdit && <Button variant="ghost" size="icon" onClick={() => openFormDialog(v)} title="Edit">
                                    <Pencil className="h-4 w-4" />
                                </Button>}
                                {canDelete && <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(v.id)} className="text-destructive hover:text-destructive" title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                </Button>}
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            No vehicles found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
      </div>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVehicleToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
