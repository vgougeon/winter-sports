import * as BABYLON from 'babylonjs';

export function setUVScale(mesh: BABYLON.Mesh, uScale: number, vScale: number) {
    var i,
        UVs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind),
        len = UVs!.length || 0;

    if (uScale !== 1) {
        for (i = 0; i < len; i += 2) {
            UVs![i] *= uScale;
        }
    }
    if (vScale !== 1) {
        for (i = 1; i < len; i += 2) {
            UVs![i] *= vScale;
        }
    }

    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, UVs || []);
}
