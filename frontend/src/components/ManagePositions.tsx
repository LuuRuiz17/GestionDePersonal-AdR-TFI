import { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { PositionCard } from './PositionCard';
import { PositionDialog } from './PositionDialog';
import { toast } from 'sonner';

export interface Position {
  id: string;
  name: string;
  sector: string;
  sectorId?: number;
  hourlyRate: number;
  minDailyHours: number;
}

interface ManagePositionsProps {
  onBack: () => void;
}

export function ManagePositions({ onBack }: ManagePositionsProps) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionsData, setPositionsData] = useState<any[]>([]); // Guardar datos completos de la API
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar puestos desde la API
  useEffect(() => {
    const fetchPositions = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      try {
        const response = await fetch('https://accompanied-adjusted-pray-association.trycloudflare.com/api/jobpositions/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        
        // Console.log de la respuesta completa
        console.log('Respuesta completa de la API (GET puestos):', data);

        if (data.puestos) {
          // Guardar datos completos
          setPositionsData(data.puestos);
          
          // Mapear los datos del API al formato de Position
          const mappedPositions: Position[] = data.puestos.map((pos: any) => ({
            id: String(pos.id),
            name: pos.nombre,
            sector: pos.sector?.nombre || 'Sin Sector',
            sectorId: pos.sector?.id,
            hourlyRate: pos.valorHora,
            minDailyHours: pos.horasMinimasTrabajoDiario,
          }));
          setPositions(mappedPositions);
        }
      } catch (error) {
        console.error('Error al cargar puestos:', error);
        toast.error('Error al cargar puestos', {
          description: 'No se pudieron obtener los datos de los puestos'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPositions();
  }, []);

  // Agrupar puestos por sector
  const positionsBySector = positions.reduce((acc, position) => {
    if (!acc[position.sector]) {
      acc[position.sector] = [];
    }
    acc[position.sector].push(position);
    return acc;
  }, {} as Record<string, Position[]>);

  // Ordenar sectores alfabéticamente
  const sortedSectors = Object.keys(positionsBySector).sort();

  // Obtener lista única de sectores
  const existingSectors = sortedSectors;

  const handleAddPosition = () => {
    setEditingPosition(null);
    setIsDialogOpen(true);
  };

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position);
    setIsDialogOpen(true);
  };

  const handleDeletePosition = async (id: string) => {
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await fetch(`https://accompanied-adjusted-pray-association.trycloudflare.com/api/jobpositions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      // Console.log de la respuesta
      console.log('Respuesta completa de la API (DELETE puesto):', data);

      if (data.status === 'success') {
        // Eliminar del estado local
        setPositions(positions.filter((p) => p.id !== id));
        setPositionsData(positionsData.filter((p) => String(p.id) !== id));
        
        // Toast de éxito
        toast.success('Puesto eliminado', {
          description: 'El puesto ha sido eliminado correctamente'
        });
      } else {
        toast.error('Error al eliminar', {
          description: data.mensaje || 'No se pudo eliminar el puesto'
        });
      }
    } catch (error) {
      console.error('Error al eliminar puesto:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      });
    }
  };

  const handleSavePosition = async (position: Position) => {
    if (editingPosition) {
      // Editar puesto existente - llamar a API PUT
      const token = localStorage.getItem('authToken');
      
      try {
        // Obtener datos completos del puesto para tener el sector id
        const posData = positionsData.find(p => String(p.id) === position.id);
        
        const positionDTO = {
          nombre: position.name,
          sector: {
            id: position.sectorId || posData?.sector?.id || 1
          },
          valorHora: position.hourlyRate,
          horasMinimasTrabajoDiario: position.minDailyHours
        };

        const response = await fetch(`https://accompanied-adjusted-pray-association.trycloudflare.com/api/jobpositions/${position.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(positionDTO)
        });

        const data = await response.json();
        
        // Console.log de la respuesta
        console.log('Respuesta completa de la API (PUT puesto):', data);

        if (data.status === 'success') {
          // Recargar la lista de puestos
          const reloadResponse = await fetch('https://accompanied-adjusted-pray-association.trycloudflare.com/api/jobpositions/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const reloadData = await reloadResponse.json();
          if (reloadData.puestos) {
            setPositionsData(reloadData.puestos);
            const mappedPositions: Position[] = reloadData.puestos.map((pos: any) => ({
              id: String(pos.id),
              name: pos.nombre,
              sector: pos.sector?.nombre || 'Sin Sector',
              sectorId: pos.sector?.id,
              hourlyRate: pos.valorHora,
              minDailyHours: pos.horasMinimasTrabajoDiario,
            }));
            setPositions(mappedPositions);
          }
          
          // Toast de éxito
          toast.success('Puesto actualizado', {
            description: 'Los datos del puesto han sido actualizados correctamente'
          });
        } else {
          toast.error('Error al actualizar', {
            description: data.mensaje || 'No se pudo actualizar el puesto'
          });
        }
      } catch (error) {
        console.error('Error al actualizar puesto:', error);
        toast.error('Error de conexión', {
          description: 'No se pudo conectar con el servidor'
        });
      }
    } else {
      // Agregar nuevo puesto - POST
      const token = localStorage.getItem('authToken');
      
      try {
        const positionDTO = {
          nombre: position.name,
          valorHora: position.hourlyRate,
          horasMinimasTrabajoDiario: position.minDailyHours,
          sector: {
            id: position.sectorId
          }
        };

        console.log('Enviando POST a /api/jobpositions/ con body:', positionDTO);

        const response = await fetch('https://accompanied-adjusted-pray-association.trycloudflare.com/api/jobpositions/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(positionDTO)
        });

        const data = await response.json();
        
        // Console.log de la respuesta
        console.log('Respuesta completa de la API (POST puesto):', data);

        if (data.status === 'success' || data.puesto) {
          // Recargar la lista de puestos
          const reloadResponse = await fetch('https://accompanied-adjusted-pray-association.trycloudflare.com/api/jobpositions/', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const reloadData = await reloadResponse.json();
          if (reloadData.puestos) {
            setPositionsData(reloadData.puestos);
            const mappedPositions: Position[] = reloadData.puestos.map((pos: any) => ({
              id: String(pos.id),
              name: pos.nombre,
              sector: pos.sector?.nombre || 'Sin Sector',
              sectorId: pos.sector?.id,
              hourlyRate: pos.valorHora,
              minDailyHours: pos.horasMinimasTrabajoDiario,
            }));
            setPositions(mappedPositions);
          }
          
          // Toast de éxito
          toast.success('Puesto creado', {
            description: 'El nuevo puesto ha sido creado correctamente'
          });
        } else {
          toast.error('Error al crear', {
            description: data.mensaje || 'No se pudo crear el puesto'
          });
        }
      } catch (error) {
        console.error('Error al crear puesto:', error);
        toast.error('Error de conexión', {
          description: 'No se pudo conectar con el servidor'
        });
      }
    }
    setIsDialogOpen(false);
    setEditingPosition(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPosition(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Menú
          </Button>
          <div>
            <h2>Gestionar Puestos</h2>
            <p className="text-gray-600 text-sm mt-1">
              Administre los puestos de trabajo de la organización
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3>Lista de Puestos</h3>
          <Button onClick={handleAddPosition} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Agregar Puesto
          </Button>
        </div>

        <div className="space-y-8">
          {sortedSectors.map((sector) => (
            <div key={sector}>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg mb-4">
                <h4>{sector}</h4>
                <p className="text-sm text-blue-100">
                  {positionsBySector[sector].length} puesto(s)
                </p>
              </div>
              <div className="space-y-3 pl-4">
                {positionsBySector[sector].map((position) => (
                  <PositionCard
                    key={position.id}
                    position={position}
                    onEdit={handleEditPosition}
                    onDelete={handleDeletePosition}
                  />
                ))}
              </div>
            </div>
          ))}

          {positions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>No hay puestos registrados</p>
              <p className="text-sm mt-2">
                Haga clic en "Agregar Puesto" para comenzar
              </p>
            </div>
          )}
        </div>
      </div>

      <PositionDialog
        isOpen={isDialogOpen}
        position={editingPosition}
        onSave={handleSavePosition}
        onClose={handleCloseDialog}
        existingSectors={existingSectors}
      />
    </div>
  );
}