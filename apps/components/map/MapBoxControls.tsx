import { MinusIcon, Move, PlusIcon, Square, Trash2 } from "lucide-react";

import { useMap } from "@/context/map-context";
import { Button } from '../ui/button';
import { useEffect, useState } from "react";
import { useT } from "@/hooks/use-inline-translation";
import { useToast } from "../ui/use-toast";


export const MapBoxControls = () => {
  const { map } = useMap();
  const t = useT();


  const zoomIn = () => {
    map?.zoomIn();
  };

  const zoomOut = () => {
    map?.zoomOut();
  };


  return (
    <aside className="absolute bottom-8 right-4 z-10 bg-background p-2 rounded-lg shadow-lg flex flex-col gap-2">
      <Button type="button" variant="ghost" size="icon" onClick={zoomIn}>
        <PlusIcon className="w-5 h-5" />
        <span className="sr-only">{t('Zoom in')}</span>
      </Button>
      <Button type="button" variant="ghost" size="icon" onClick={zoomOut}>
        <MinusIcon className="w-5 h-5" />
        <span className="sr-only">{t('Zoom out')}</span>
      </Button>
    </aside>
  );
}



export const DrawControls = ({ canAddMultiplePolygone }: { canAddMultiplePolygone: boolean }) => {
  const { draw, map } = useMap();
  const t = useT();
  const [activeMode, setActiveMode] = useState('simple_select');
  const { toast } = useToast();

  const handleDrawPolygon = () => {
    const coordinates = (draw?.getAll().features?.[0]?.geometry as any)?.coordinates?.[0].length ?? 0;
    if (coordinates > 2 && !canAddMultiplePolygone) {
      toast({
        title: t('Error'),
        description: t('You can only draw one polygon by zone, update or delete the existing polygon first'),
        variant: 'destructive',
      });
      return;
    }
    draw?.changeMode('draw_polygon');
    setActiveMode('draw_polygon');
  };

  const handleDelete = () => {
    const selectedIds = draw?.getSelectedIds() ?? [];
    if (selectedIds.length > 0) {
      draw?.delete(selectedIds);
    }
  };

  const handleSimpleSelect = () => {
    draw?.changeMode('simple_select');
    setActiveMode('simple_select');
  };

  useEffect(() => {
    if (map) {
      map.on('draw.create', () => {
        setActiveMode('simple_select');
      });
    }
  }, [map]);

  return (
    <div className="absolute top-8 right-4 z-10 bg-background p-2 rounded-lg shadow-lg flex flex-col gap-2">
      <div className="flex flex-col">
        <Button
          variant={activeMode === 'draw_polygon' ? 'default' : 'ghost'}
          size="icon"
          type="button"
          onClick={handleDrawPolygon}
          className="rounded-none rounded-t-md"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          variant={activeMode === 'simple_select' || activeMode === 'direct_select' ? 'default' : 'ghost'}
          size="icon"
          type="button"
          onClick={handleSimpleSelect}
          className="rounded-none border-t"
        >
          <Move className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          type="button"
          onClick={handleDelete}
          className="rounded-none rounded-b-md border-t"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}