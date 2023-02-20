import { fields, volumes, metashapes, ProcessorGraph } from './dist/index.js'
import { plot } from 'nodeplotlib'

const volume = new metashapes.MetaShapeVolume(new metashapes.MetaSphere())

const processors = new ProcessorGraph([
    new volumes.VolumeSamplingProcessor()
])

/**
 * @type {volumes.VolumeSamplingProcessing}
 */
const processing = {
    [volumes.VolumeSamplingProcessing_SamplerSettings]: {
        margin: 1,
        resolution: 10
    }
}

/**
 * @type {volumes.VolumeProcessingContext}
 */
const context = {
    samples: {},
    sampling: {
        volume
    }
}

processors.init(context)
processors.process(processing, context)

plot([
    {
        z: processing.sampling.voxels[0].map(yz => yz.map(z => z.presence)),
        type: 'heatmap'
    }
])
