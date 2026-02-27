import { Composition, Folder } from "remotion";
import { IntroVideo } from "./IntroVideo";
import { NewsAlert } from "./NewsAlert";
import { ExplainerVideo } from "./explainer/ExplainerVideo";
import { ChatDemo } from "./ChatDemo";
import { AxiomScandal } from "./axiom-scandal/AxiomScandal";

export const RemotionRoot = () => {
  return (
    <>
      <Folder name="CashThesis">
        <Composition
          id="IntroVideo"
          component={IntroVideo}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="NewsAlert"
          component={NewsAlert}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="ExplainerVideo"
          component={ExplainerVideo}
          durationInFrames={1350}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="ChatDemo"
          component={ChatDemo}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition
          id="AxiomScandal"
          component={AxiomScandal}
          durationInFrames={3600}
          fps={60}
          width={1080}
          height={1920}
        />
      </Folder>
    </>
  );
};
