import { Pencil, Trash2, Briefcase } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import type { Position } from './ManagePositions';

interface PositionCardProps {
  position: Position;
  onEdit: (position: Position) => void;
  onDelete: (id: string) => void;
}

export function PositionCard({ position, onEdit, onDelete }: PositionCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="mb-1">{position.name}</h4>
              <div className="flex items-center gap-4 mt-2">
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm">
                  Pago por hora: ${position.hourlyRate.toLocaleString('es-AR')}
                </div>
                <div className="bg-green-50 text-green-700 px-3 py-1 rounded text-sm">
                  Horas mínimas: {position.minDailyHours}h/día
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(position)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente el puesto "{position.name}".
                    Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(position.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}